import { invoke } from '@tauri-apps/api/core'
import { useNavigate, useParams } from 'react-router-dom'
import { Stack } from '@fluentui/react/lib/Stack'
import { Text } from '@fluentui/react/lib/Text'
import { Separator } from '@fluentui/react/lib/Separator'
import React, { useMemo } from 'react'
import { CommandBar, type ICommandBarItemProps } from '@fluentui/react'
import { openUrl } from '@/utils'
import { IS_TAURI } from '@/constant'
import { type Event, listen } from '@tauri-apps/api/event'
import type { GameWithLocalData } from '@/types'
import { useSharedState } from '@/store'

interface InfoOption {
  text: string
  value: string | ((g: GameWithLocalData) => string)
}

const timestampToDate = (time: number) => new Date(time).toLocaleDateString()

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
    text: '存档位置',
    value: () => 'F:\\Galgame'
  },
  {
    text: '创建日期',
    value: (g) => timestampToDate(g.createDate)
  },

  {
    text: '预计时长',
    value: (g) => {
      const hours = Math.floor(g.expectedPlayMinutes / 60)
      return `${g.expectedPlayMinutes % 60 > 30 ? hours + 1 : hours}h`
    }
  },
  {
    text: '游玩时长',
    value: (g) => {
      const hours = Math.floor(g.playMinutes / 60)
      const minutes = g.playMinutes % 60
      return hours === 0 ? `${minutes}m` : `${hours}h${minutes}m`
    }
  },
  {
    text: '游玩次数',
    value: () => Math.floor(Math.random() * 10).toString()
  },
  {
    text: '上次游玩',
    value: (g) => (g.lastPlay ? timestampToDate(g.lastPlay) : '---')
  }
]

export const Detail: React.FC = () => {
  const { id } = useParams()
  const navigate = useNavigate()

  const games = useSharedState((state) => state.getAllData)()
  const game = games.find((game) => game.id.toString() === id)

  if (!game) {
    return <div>游戏不存在</div>
  }

  const commandItems: ICommandBarItemProps[] = [
    {
      key: 'sync',
      text: '同步游戏',
      iconProps: { iconName: 'Link12' },
      onClick: () => {}
    },
    {
      key: 'start',
      text: '开始游戏',
      iconProps: { iconName: 'Play' },
      canCheck: false,
      onClick: async () => {
        await invoke('launch_and_monitor', { filePath: 'F:\\樱花，萌放 v1.08\\樱花，萌放\\SakuraChs.exe' })
        console.log('Start successfully')
        listen('finished', (data: Event<[string, number, number]>) => {
          console.log(
            `Finished\nProcess name: ${data.payload[0]}\nCost time: ${data.payload[1]}\nPlay time: ${data.payload[2]}`
          )
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
      canCheck: IS_TAURI,

      onClick: async () => {
        await invoke('open_with_notepad', { filePath: 'F:\\爱因斯坦携爱敬上\\请读我.txt' })
      }
    },
    {
      key: 'backup',
      text: '备份存档',
      iconProps: { iconName: 'CloudUpload' },
      canCheck: IS_TAURI,

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
            onClick: async () => {
              await invoke('open_with_explorer', { directory: 'F:\\樱花，萌放 v1.08\\樱花，萌放' })
            }
          },
          {
            key: 'save',
            text: '打开存档目录',
            iconProps: { iconName: 'Save' },

            onClick: async () => {
              await invoke('open_with_explorer', { directory: 'F:\\樱花，萌放 v1.08\\樱花，萌放\\extra' })
            }
          },
          {
            key: 'vndb',
            text: '查看 Vndb 页面',
            iconProps: { iconName: 'Go' },
            canCheck: !!game.vndbId,
            onClick: () => {
              openUrl(`https://vndb.org/${game.vndbId}`)
            }
          },
          {
            key: 'bangumi',
            text: '查看 Bangumi 页面',
            iconProps: { iconName: 'Go' },
            canCheck: false,
            onClick: () => {
              openUrl(`https://bgm.tv/subject/${game.bgmId}`)
            }
          },
          {
            key: 'delete',
            text: '删除游戏',
            iconProps: { iconName: 'Delete' },
            onClick: () => {}
          }
        ]
      }
    }
  ]
  const handledCommandItems = useMemo(
    () =>
      commandItems.filter((item) => {
        if (item.key === 'more') {
          // biome-ignore lint:
          const newItem = item as any
          newItem.subMenuProps.items = (newItem.subMenuProps.items as ICommandBarItemProps[]).filter(({ key }) => {
            switch (key) {
              case 'vndb':
                return !!game.vndbId
              case 'bangumi':
                return !!game.bgmId
              case 'explorer':
                return IS_TAURI && !!game.local?.programFile
              case 'save':
                return IS_TAURI && !!game.local?.savePath
            }
            return true
          })
          return true
        }
        return IS_TAURI ? !!game.local || ['sync', 'edit'].includes(item.key) : item.key === 'edit'
      }),
    // biome-ignore lint:
    [commandItems, game]
  )

  return (
    <React.Fragment>
      <CommandBar className="border-b ml-auto" items={handledCommandItems} />
      <div className="overflow-auto">
        <Stack horizontal horizontalAlign="stretch" tokens={{ childrenGap: 16 }}>
          <Stack tokens={{ childrenGap: 2 }} className="mt-4">
            <img src={game.cover} alt={game.title} className="max-h-65 max-w-40 lg:max-w-80 rounded-lg shadow-lg" />

            {/*           <PrimaryButton text="开始游戏" className="w-full" />
          <DefaultButton text="编辑信息" className="w-full" />
          <Stack horizontal tokens={{ childrenGap: 8 }} className="w-full">
            <DefaultButton text="游玩状态" className="flex-grow" />
            <DefaultButton text="打开文本" className="flex-grow" />
          </Stack> */}
          </Stack>
          <Stack className="flex-grow" tokens={{ childrenGap: 12 }}>
            <Text variant="xxLargePlus" className="font-semibold line-height-normal">
              {game.title}
            </Text>
            <Stack horizontal verticalAlign="center" className="max-w-60vw">
              <Stack className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {infoOptions.map((option) => (
                  <Text key={option.text} variant="medium">
                    <strong>{option.text}</strong>
                    <br />
                    {typeof option.value === 'function' ? option.value(game) : game[option.value as 'title']}
                  </Text>
                ))}
              </Stack>
              <Text variant="mega" className="ml-24 font-semibold">
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
