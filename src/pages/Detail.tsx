import { invoke } from '@tauri-apps/api/core'
import { useNavigate, useParams } from 'react-router-dom'
import { Stack } from '@fluentui/react/lib/Stack'
import { Text } from '@fluentui/react/lib/Text'
import { Separator } from '@fluentui/react/lib/Separator'
import React, { useMemo, useState } from 'react'
import { CommandBar, type ICommandBarItemProps } from '@fluentui/react'
import { openUrl } from '@/utils'
import { IS_TAURI } from '@/constant'
import { type Event, listen } from '@tauri-apps/api/event'
import type { GameWithLocalData, LocalData } from '@/types'
import useStore, { useSharedStore } from '@/store'
import { SyncModal } from '@/components/SyncModal'
import { ConfirmBox } from '@/components/ConfirmBox'

interface InfoOption {
  text: string
  value: keyof GameWithLocalData | ((g: GameWithLocalData) => string)
}

const timestampToDate = (time: number) => new Date(time).toLocaleString()

const infoOptions: InfoOption[] = [
  {
    text: '开发商',
    value: 'developer'
  },
  {
    text: '发布日期',
    value: (g) => timestampToDate(g.releaseDate)
  },
  {
    text: '创建日期',
    value: (g) => timestampToDate(g.createDate)
  },

  {
    text: '预计时长',
    value: (g) => `${g.expectedPlayHours}h`
  },
  {
    text: '游玩时长',

    value: (g) => {
      const playMinutes = g.palyTimelines.reduce((acc, cur) => acc + cur[2], 0) / 1000 / 60
      const hours = Math.floor(playMinutes / 60)
      const minutes = Math.floor(playMinutes % 60)
      return hours === 0 ? `${minutes}m` : `${hours}h${minutes}m`
    }
  },
  {
    text: '游玩次数',
    value: (g) => `${g.palyTimelines.length} 次`
  },
  {
    text: '上次游玩',
    value: (g) => (g.lastPlay ? timestampToDate(g.lastPlay) : '---')
  }
]

export const Detail: React.FC = () => {
  const { id } = useParams()
  const navigate = useNavigate()

  const [isOpenSyncModal, setIsOpenSyncModal] = useState(false)
  const [isOpenDeleteModal, setIsOpenDeleteModal] = useState(false)
  const [isOpenDelete2Modal, setIsOpenDelete2Modal] = useState(false)

  const { setRunning, isRunning } = useStore((state) => state)
  const { getData, getDataByProgramFile, updateData, removeData, addPlayTimeline } = useSharedStore((state) => state)
  const [game, setGame] = useState(getData(id ?? ''))

  if (!game) {
    return <div>游戏不存在</div>
  }

  const commandItems: ICommandBarItemProps[] = [
    {
      key: 'sync',
      text: '同步游戏',
      iconProps: { iconName: 'Link12' },
      onClick: () => setIsOpenSyncModal(true)
    },
    {
      key: 'start',
      text: '开始游戏',
      iconProps: { iconName: 'Play' },
      disabled: !game.local?.programFile,
      onClick: () => {
        if (isRunning((game.local as LocalData).programFile)) return
        invoke('launch_and_monitor', { filepath: game.local?.programFile }).then(() => {
          console.log('Start successfully', game.title, '\n', id)
          setRunning((game.local as LocalData).programFile, game.id, true)
          updateData({ ...game, lastPlay: Date.now() })
          setGame(getData(id as string))

          listen('finished', (data: Event<[string, number, number, number]>) => {
            const gameHandled = getDataByProgramFile(data.payload[0])
            if (!gameHandled) return

            console.log(
              `Finished\nProcess name: ${data.payload[0]}\nStart time: ${data.payload[1]}\nStop time: ${data.payload[2]}\n Active time: ${data.payload[3]}\n`,
              '\n'
            )
            setRunning((game.local as LocalData).programFile, game.id, false)
            addPlayTimeline(gameHandled.id, data.payload.slice(1) as [number, number, number])
            if (id === gameHandled.id) setGame(getData(gameHandled.id as string))
          })
        })
      }
    },
    {
      key: 'edit',
      text: '编辑信息',
      iconProps: { iconName: 'Edit' },
      onClick: () => navigate(`/edit/${id}`)
    },
    {
      key: 'guide',
      text: '查看攻略',
      iconProps: { iconName: 'ReadingMode' },
      disabled: !game.local?.guideFile,
      onClick: () => {
        invoke('open_with_notepad', { filepath: game.local?.guideFile })
      }
    },
    {
      key: 'backup',
      text: '备份存档',
      iconProps: { iconName: 'CloudUpload' },
      disabled: !game.local?.savePath,
      onClick: () => {
        // invoke('backup', )
      }
    },
    {
      key: 'more',
      text: '更多',
      iconProps: { iconName: 'More' },
      subMenuProps: {
        items: [
          {
            key: 'explorer',
            text: '打开游戏目录',
            iconProps: { iconName: 'OpenFolderHorizontal' },
            disabled: !game.local?.programFile,
            onClick: () => {
              invoke('open_with_explorer', {
                directory: game.local?.programFile.split(/[/\\]/).slice(0, -1).join('\\')
              })
            }
          },
          {
            key: 'save',
            text: '打开存档目录',
            iconProps: { iconName: 'Save' },
            disabled: !game.local?.savePath,
            onClick: () => {
              invoke('open_with_explorer', { directory: game.local?.savePath })
            }
          },
          {
            key: 'vndb',
            text: '查看 Vndb 页面',
            iconProps: { iconName: 'Go' },
            disabled: !game.vndbId,
            onClick: () => {
              openUrl(`https://vndb.org/${game.vndbId}`)
            }
          },
          {
            key: 'bangumi',
            text: '查看 Bangumi 页面',
            iconProps: { iconName: 'Go' },
            disabled: !game.bgmId,
            onClick: () => {
              openUrl(`https://bgm.tv/subject/${game.bgmId}`)
            }
          },
          {
            key: 'delete',
            text: '删除本地同步',
            iconProps: { iconName: 'Delete' },
            disabled: !game.local,
            onClick: () => setIsOpenDeleteModal(true)
          },
          {
            key: 'delete2',
            text: '删除游戏',
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
        text="删除本地同步后需重新设置游戏启动程序，但不会删除本地游戏文件，是否继续？"
        onConfirm={() => removeData(id as string, true)}
      />
      <ConfirmBox
        isOpen={isOpenDelete2Modal}
        setIsOpen={setIsOpenDelete2Modal}
        text="该操作会删除游戏数据与云端存档备份，但不会删除本地游戏文件，是否继续？"
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
            简介
          </Text>
          <Text className="mt-4" variant="medium">
            {game.description}
          </Text>
        </Stack>
        <Separator />
        <Stack>
          <Text variant="large" className="font-semibold">
            标签
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
