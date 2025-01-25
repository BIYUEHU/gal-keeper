import { useNavigate, useParams } from 'react-router-dom'
import { Stack } from '@fluentui/react/lib/Stack'
import { Text } from '@fluentui/react/lib/Text'
import { Separator } from '@fluentui/react/lib/Separator'
import React, { useMemo, useState } from 'react'
import { CommandBar, type ICommandBarItemProps } from '@fluentui/react'
import { calculateTotalPlayTime, invokeSafe, openUrl, showMinutes } from '@/utils'
import { IS_TAURI } from '@/constant'
import { type Event, listen } from '@tauri-apps/api/event'
import type { GameWithLocalData } from '@/types'
import { useSharedStore } from '@/store'
import { SyncModal } from '@/components/SyncModal'
import { ConfirmBox } from '@/components/ConfirmBox'
import { logger } from '@/utils/logger'
import { f, t } from '@/utils/i18n'

interface InfoOption {
  text: string
  value: keyof GameWithLocalData | ((g: GameWithLocalData) => string)
}

const timestampToDate = (time: number) => new Date(time).toLocaleString()

const infoOptions: InfoOption[] = [
  {
    text: t`page.detail.info.developer`,
    value: 'developer'
  },
  {
    text: t`page.detail.info.releaseDate`,
    value: (g) => timestampToDate(g.releaseDate)
  },
  {
    text: t`page.detail.info.createDate`,
    value: (g) => timestampToDate(g.createDate)
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
    value: (g) => (g.lastPlay ? timestampToDate(g.lastPlay) : '---')
  }
]

export const Detail: React.FC = () => {
  const { id } = useParams()
  const navigate = useNavigate()

  const [isOpenSyncModal, setIsOpenSyncModal] = useState(false)
  const [isOpenDeleteModal, setIsOpenDeleteModal] = useState(false)
  const [isOpenDelete2Modal, setIsOpenDelete2Modal] = useState(false)

  const { getData, updateData, removeData, increasePlayTimeline, isRunning } = useSharedStore((state) => state)
  const [game, setGame] = useState(getData(id ?? ''))

  if (!game) {
    return <div>{t`page.detail.game.notFound`}</div>
  }

  const commandItems: ICommandBarItemProps[] = [
    {
      key: 'sync',
      text: t`page.detail.command.sync`,
      iconProps: { iconName: 'Link12' },
      onClick: () => setIsOpenSyncModal(true)
    },
    {
      key: 'start',
      text: t`page.detail.command.start`,
      iconProps: { iconName: 'Play' },
      disabled: !game.local?.programFile,
      onClick: () => {
        if (isRunning(game.id)) {
          logger.warn('Game is already running', game.title, '\n', id)
          return
        }
        invokeSafe('launch_and_monitor', { filepath: game.local?.programFile }).then(() => {
          const id = game.id
          logger.record('Start successfully', game.title, '\n', id)
          // TODO: update data -> increasePlayTimeline
          updateData({ ...game, lastPlay: Date.now() })
          setGame(getData(id))

          let startTime: undefined | number

          listen('increase', (data: Event<[number, number]>) => {
            if (!startTime) startTime = data.payload[0]
            increasePlayTimeline(id, ...data.payload)
            logger.debug('increase', data.payload, id)

            // logger.record(
            //   `Finished\nProcess name: ${data.payload[0]}\nStart time: ${data.payload[1]}\nStop time: ${data.payload[2]}\nActive time: ${data.payload[3]}\n`,
            //   '\n'
            // )
          })
        })
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
      onClick: () => {
        invokeSafe('open_with_explorer', { directory: game.local?.guideFile })
      }
    },
    {
      key: 'backup',
      text: t`page.detail.command.backup`,
      iconProps: { iconName: 'CloudUpload' },
      disabled: !game.local?.savePath,
      onClick: () => {
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
            onClick: () => {
              invokeSafe('open_with_explorer', {
                directory: game.local?.programFile.split(/[/\\]/).slice(0, -1).join('\\')
              })
            }
          },
          {
            key: 'save',
            text: t`page.detail.command.openSaveDir`,
            iconProps: { iconName: 'Save' },
            disabled: !game.local?.savePath,
            onClick: () => {
              invokeSafe('open_with_explorer', { directory: game.local?.savePath })
            }
          },
          {
            key: 'vndb',
            text: t`page.detail.command.viewVndb`,
            iconProps: { iconName: 'Go' },
            disabled: !game.vndbId,
            onClick: () => {
              openUrl(`https://vndb.org/${game.vndbId}`)
            }
          },
          {
            key: 'bangumi',
            text: t`page.detail.command.viewBangumi`,
            iconProps: { iconName: 'Go' },
            disabled: !game.bgmId,
            onClick: () => {
              openUrl(`https://bgm.tv/subject/${game.bgmId}`)
            }
          },
          {
            key: 'delete',
            text: t`page.detail.command.deleteSync`,
            iconProps: { iconName: 'Delete' },
            disabled: !game.local,
            onClick: () => setIsOpenDeleteModal(true)
          },
          {
            key: 'delete2',
            text: t`page.detail.command.deleteGame`,
            iconProps: { iconName: 'Delete' },
            onClick: () => setIsOpenDelete2Modal(true)
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
      <SyncModal data={game} isOpen={isOpenSyncModal} setIsOpen={setIsOpenSyncModal} />
      <ConfirmBox
        isOpen={isOpenDeleteModal}
        setIsOpen={setIsOpenDeleteModal}
        text={t`page.detail.modal.deleteSync`}
        onConfirm={() => removeData(id as string, true)}
      />
      <ConfirmBox
        isOpen={isOpenDelete2Modal}
        setIsOpen={setIsOpenDelete2Modal}
        text={t`page.detail.modal.deleteGame`}
        onConfirm={() => {
          setTimeout(() => {
            removeData(id as string, false)
            navigate('/library')
          }, 0)
        }}
      />
      <CommandBar className="border-b w-full flex justify-end overflow-visible" items={handledCommandItems} />
      <div className="overflow-auto">
        <Stack horizontal horizontalAlign="stretch" tokens={{ childrenGap: 16 }}>
          <Stack tokens={{ childrenGap: 2 }} className="mt-4">
            <img src={game.cover} alt={game.title} className="max-h-65 max-w-40 lg:max-w-80 rounded-lg shadow-lg" />
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
