import { useState } from 'react'
import { GameGrid } from '@/components/GameGrid/GameGrid'
import { SearchBox } from '@fluentui/react/lib/SearchBox'
import { CommandBar, ICommandBarItemProps } from '@fluentui/react/lib/CommandBar'
import games from '@/data/games.json'

export const GameLibrary: React.FC = () => {
  const [searchText, setSearchText] = useState('')

  const commandItems: ICommandBarItemProps[] = [
    {
      key: 'add',
      text: '添加游戏',
      iconProps: { iconName: 'Add' },
      onClick: () => {
        /* 实现添加游戏逻辑 */
      }
    },
    {
      key: 'sort',
      text: '排序',
      iconProps: { iconName: 'Sort' },
      subMenuProps: {
        items: [
          { key: 'name', text: '按名称' },
          { key: 'date', text: '按日期' },
          { key: 'rating', text: '按评分' }
        ]
      }
    },
    {
      key: 'filter',
      text: '筛选',
      iconProps: { iconName: 'Filter' }
    }
  ]

  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b">
        <div className="flex items-center justify-between mb-4">
          <SearchBox
            placeholder="搜索游戏..."
            value={searchText}
            onChange={(_, newValue) => setSearchText(newValue || '')}
            className="w-80"
          />
        </div>
        <CommandBar items={commandItems} />
      </div>
      <div className="flex-1 overflow-auto">
        <GameGrid games={games.sort((a, b) => b.id - a.id)} />
      </div>
    </div>
  )
}
