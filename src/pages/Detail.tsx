import { useParams } from 'react-router-dom'
import { Stack } from '@fluentui/react/lib/Stack'
import { PrimaryButton, DefaultButton, IconButton } from '@fluentui/react/lib/Button'
import { Text } from '@fluentui/react/lib/Text'
import { Separator } from '@fluentui/react/lib/Separator'
import games from '@/data/games.json'
import React from 'react'

interface InfoOption {
  text: string
  value: string | ((g: (typeof games)[number]) => string)
}

const timestampToDate = (time: number) => new Date(time).toLocaleDateString()

export const Detail: React.FC = () => {
  const { id } = useParams()
  const game = games.find((item) => item.id.toString() === id)

  if (!game) {
    return <div>游戏不存在</div>
  }

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
      value: () => 'E:\\galgame\\save'
    },
    {
      text: '创建日期',
      value: (g) => timestampToDate(g.createDate)
    },
    {
      text: '上次游玩',
      value: (g) => timestampToDate(g.lastPlay)
    },
    {
      text: '游玩时长',
      value: (g) => {
        const hours = Math.floor(g.playMinutes / 60)
        const minutes = g.playMinutes % 60
        return hours === 0 ? `${minutes}h` : `${hours}h${minutes}m`
      }
    },
    {
      text: '预计时长',
      value: () => '233h'
    }
  ]

  return (
    <Stack className="overflow-auto max-h-full" horizontal horizontalAlign="stretch" tokens={{ childrenGap: 16 }}>
      <Stack className="w-72">
        <img src={game.cover} alt={game.title} className="w-full rounded-lg shadow-lg" />
        <Stack tokens={{ childrenGap: 8 }} className="mt-4">
          <PrimaryButton text="开始游戏" className="w-full" />
          <DefaultButton text="编辑信息" className="w-full" />
          <Stack horizontal tokens={{ childrenGap: 8 }} className="w-full">
            <DefaultButton text="游玩状态" className="flex-grow" />
            <DefaultButton text="打开文本" className="flex-grow" />
          </Stack>
        </Stack>
      </Stack>

      <Stack className="flex-grow" tokens={{ childrenGap: 16 }}>
        <Stack horizontal verticalAlign="center" horizontalAlign="space-between">
          <Text variant="xxLargePlus" className="font-semibold">
            {game.title}
          </Text>
          <Text variant="mega" className="mt-4 font-semibold">
            {game.rating.toFixed(1)}
          </Text>
        </Stack>
        <Separator />
        <Stack tokens={{ childrenGap: 8 }} className="grid grid-cols-2 lg:grid-cols-3 gap-4">
          {infoOptions.map((option) => (
            <Text key={option.text} variant="medium">
              <strong>{option.text}：</strong>
              {typeof option.value === 'function' ? option.value(game) : game[option.value as 'title']}
            </Text>
          ))}
        </Stack>
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
          <Stack className="mt-4 mb-6 pb-10 max-w-90%" horizontal wrap tokens={{ childrenGap: 8 }}>
            {game.tags.map((tag) => (
              <Text key={tag} className="px-3 py-1 bg-gray-100 rounded-lg">
                {tag}
              </Text>
            ))}
          </Stack>
        </Stack>
      </Stack>
    </Stack>
  )
}
