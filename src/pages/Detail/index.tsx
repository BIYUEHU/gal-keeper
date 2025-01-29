import { useNavigate, useParams } from 'react-router-dom'
import { Stack } from '@fluentui/react/lib/Stack'
import { Text } from '@fluentui/react/lib/Text'
import { Separator } from '@fluentui/react/lib/Separator'
import React, { useEffect, useMemo, useState } from 'react'
import { CommandBar, type ICommandBarItemProps } from '@fluentui/react'
import { calculateTotalPlayTime, openUrl, showMinutes, showTime } from '@/utils'
import { IS_TAURI } from '@/constant'
import type { GameWithLocalData } from '@/types'
import useStore from '@/store'
import SyncModal from '@/components/SyncModal'
import ConfirmBox from '@/components/ConfirmBox'
import { f, t } from '@/utils/i18n'
import { invoke } from '@tauri-apps/api'
import events from '@/utils/events'
import logger, { invokeLogger } from '@/utils/logger'

interface InfoOption {
  text: string
  value: keyof GameWithLocalData | ((g: GameWithLocalData) => string)
}

const infoOptions: InfoOption[] = [
  {
    text: t`page.detail.info.developer`,
    value: 'developer'
  },
  {
    text: t`page.detail.info.releaseDate`,
    value: (g) => new Date(g.releaseDate).toLocaleDateString()
  },
  {
    text: t`page.detail.info.createDate`,
    value: (g) => new Date(g.createDate).toLocaleDateString()
  },

  {
    text: t`page.detail.info.expectedPLayHours`,
    value: (g) => `${g.expectedPlayHours}h`
  },
  {
    text: t`page.detail.info.playTime`,

    value: (g) => showMinutes(calculateTotalPlayTime(g.playTimelines))
  },
  {
    text: t`page.detail.info.playCount`,
    value: (g) => f`page.detail.info.playCount.value`(g.playTimelines.length.toString())
  },
  {
    text: t`page.detail.info.lastPlay`,
    value: (g) => (g.lastPlay ? showTime(g.lastPlay / 1000) : '---')
  }
]

const Detail: React.FC = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [modalData, setModalData] = useState({
    isOpenSyncModal: false,
    isOpenDeleteModal: false,
    isOpenDelete2Modal: false
  })

  const { getGameData, removeGameData, isRunningGame } = useStore((state) => state)
  const [game, setGame] = useState(getGameData(id ?? ''))

  useEffect(() => {
    events.on('updateGame', (id: string) => {
      if (id === game?.id) setGame(getGameData(id))
    })
  }, [game, getGameData])

  if (!game) {
    return <div>{t`page.detail.game.notFound`}</div>
  }

  const commandItems: ICommandBarItemProps[] = [
    {
      key: 'sync',
      text: t`page.detail.command.sync`,
      iconProps: { iconName: 'Link12' },
      onClick: () => setModalData({ ...modalData, isOpenSyncModal: true })
    },
    {
      key: 'start',
      text: t`page.detail.command.start`,
      iconProps: { iconName: 'Play' },
      disabled: !game.local?.programFile,
      onClick: () => {
        const id = game.id
        if (isRunningGame(id)) {
          logger.debug('Game is already running, title:', game.title, ', id:', id)
          return
        }
        invoke('launch_and_monitor', { id, filepath: game.local?.programFile })
          .then(() => logger.debug('Start successfully, title:', game.title, ', id:', id))
          .catch((e) => invokeLogger.error('Failed to start game', e))
      }
    },
    {
      key: 'edit',
      text: t`page.detail.command.edit`,
      iconProps: { iconName: 'Edit' },
      onClick: () => navigate(`/edit/${id}`)
    },
    {
      key: 'guide',
      text: t`page.detail.command.guide`,
      iconProps: { iconName: 'ReadingMode' },
      disabled: !game.local?.guideFile,
      onClick: () =>
        invoke('open_with_explorer', { directory: game.local?.guideFile }).catch((e) =>
          invokeLogger.error('Failed to open guide file', e)
        )
    },
    {
      key: 'backup',
      text: t`page.detail.command.backup`,
      iconProps: { iconName: 'CloudUpload' },
      disabled: !game.local?.savePath,
      onClick: () => {
        // TODO: Implement backup
        // invokeSafe('backup', )
      }
    },
    {
      key: 'more',
      text: t`page.detail.command.more`,
      iconProps: { iconName: 'More' },
      subMenuProps: {
        items: [
          {
            key: 'explorer',
            text: t`page.detail.command.openGameDir`,
            iconProps: { iconName: 'OpenFolderHorizontal' },
            disabled: !game.local?.programFile,
            onClick: () =>
              invoke('open_with_explorer', {
                directory: game.local?.programFile.split(/[/\\]/).slice(0, -1).join('\\')
              }).catch((e) => invokeLogger.error('Failed to open game directory', e))
          },
          {
            key: 'save',
            text: t`page.detail.command.openSaveDir`,
            iconProps: { iconName: 'Save' },
            disabled: !game.local?.savePath,
            onClick: () =>
              invoke('open_with_explorer', { directory: game.local?.savePath }).catch((e) =>
                invokeLogger.error('Failed to open save directory', e)
              )
          },
          {
            key: 'vndb',
            text: t`page.detail.command.viewVndb`,
            iconProps: { iconName: 'Go' },
            disabled: !game.vndbId,
            onClick: () =>
              openUrl(`https://vndb.org/${game.vndbId}`).catch((e) => invokeLogger.error('Failed to open vndb page', e))
          },
          {
            key: 'bangumi',
            text: t`page.detail.command.viewBangumi`,
            iconProps: { iconName: 'Go' },
            disabled: !game.bgmId,
            onClick: () =>
              openUrl(`https://bgm.tv/subject/${game.bgmId}`).catch((e) =>
                invokeLogger.error('Failed to open bangumi page', e)
              )
          },
          {
            key: 'delete',
            text: t`page.detail.command.deleteSync`,
            iconProps: { iconName: 'Delete' },
            disabled: !game.local,
            onClick: () => setModalData({ ...modalData, isOpenDeleteModal: true })
          },
          {
            key: 'delete2',
            text: t`page.detail.command.deleteGame`,
            iconProps: { iconName: 'Delete' },
            onClick: () => setModalData({ ...modalData, isOpenDelete2Modal: true })
          }
        ]
      }
    }
  ]

  const handledCommandItems = useMemo(
    () =>
      commandItems.filter((item) => {
        if (['edit', 'more'].includes(item.key)) return true
        if (IS_TAURI) return !game.local ? item.key === 'sync' : item.key !== 'sync'
        return false
      }),
    // biome-ignore lint:
    [commandItems, game]
  )

  return (
    <React.Fragment>
      <SyncModal
        data={game}
        isOpen={modalData.isOpenSyncModal}
        setIsOpen={(isOpen) => setModalData({ ...modalData, isOpenSyncModal: isOpen })}
      />
      <ConfirmBox
        isOpen={modalData.isOpenDeleteModal}
        setIsOpen={(isOpen) => setModalData({ ...modalData, isOpenDeleteModal: isOpen })}
        text={t`page.detail.modal.deleteSync`}
        onConfirm={() => removeGameData(id as string, true)}
      />
      <ConfirmBox
        isOpen={modalData.isOpenDelete2Modal}
        setIsOpen={(isOpen) => setModalData({ ...modalData, isOpenDelete2Modal: isOpen })}
        text={t`page.detail.modal.deleteGame`}
        onConfirm={() => {
          setTimeout(() => {
            removeGameData(id as string, false)
            navigate('/library')
          }, 0)
        }}
      />
      <CommandBar className="border-b w-full flex justify-end overflow-visible" items={handledCommandItems} />
      <div className="overflow-auto">
        <Stack horizontal horizontalAlign="stretch" tokens={{ childrenGap: 16 }}>
          <Stack tokens={{ childrenGap: 2 }} className="mt-4">
            <img
              src={game.cover || '/assets/cover.png'}
              alt={game.title}
              className="max-h-65 max-w-40 lg:max-w-80 rounded-lg shadow-lg"
            />
          </Stack>
          <Stack className="flex-grow" tokens={{ childrenGap: 12 }}>
            <Text variant="xxLargePlus" className="font-semibold line-height-normal">
              {game.title}
            </Text>
            <Stack horizontal verticalAlign="center" className="max-w-60vw">
              <Stack className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-x-18">
                {infoOptions.map((option) => (
                  <Text key={option.text} variant="medium">
                    <strong>{option.text}</strong>
                    <br />
                    {typeof option.value === 'function' ? option.value(game) : game[option.value as 'title']}
                  </Text>
                ))}
              </Stack>
              <Text variant="mega" className="ml-auto mr-4 font-semibold">
                {game.rating.toFixed(1)}
              </Text>
            </Stack>
          </Stack>
        </Stack>{' '}
        <Separator />
        <Stack>
          <Text variant="large" className="font-semibold">
            {t`page.detail.section.description`}
          </Text>
          <Text className="mt-4" variant="medium">
            {game.description}
          </Text>
        </Stack>
        <Separator />
        <Stack>
          <Text variant="large" className="font-semibold">
            {t`page.detail.section.tags`}
          </Text>
          <Stack className="mt-4 mb-6 max-w-90%" horizontal wrap tokens={{ childrenGap: 8 }}>
            {game.tags.map((tag) => (
              <Text key={tag} className="px-3 py-1 bg-gray-100 rounded-lg">
                {tag}
              </Text>
            ))}
          </Stack>
        </Stack>
      </div>
    </React.Fragment>
  )
}

export default Detail
