import { useState } from 'react';
import { GameGrid } from '../components/GameGrid/GameGrid';
import { SearchBox } from '@fluentui/react/lib/SearchBox';
import { CommandBar, ICommandBarItemProps } from '@fluentui/react/lib/CommandBar';
import { Game } from '../types/types';

export const GameLibrary: React.FC = () => {
  const [searchText, setSearchText] = useState('');
  
  const commandItems: ICommandBarItemProps[] = [
    {
      key: 'add',
      text: '添加游戏',
      iconProps: { iconName: 'Add' },
      onClick: () => {/* 实现添加游戏逻辑 */},
    },
    {
      key: 'sort',
      text: '排序',
      iconProps: { iconName: 'Sort' },
      subMenuProps: {
        items: [
          { key: 'name', text: '按名称' },
          { key: 'date', text: '按日期' },
          { key: 'rating', text: '按评分' },
        ],
      },
    },
    {
      key: 'filter',
      text: '筛选',
      iconProps: { iconName: 'Filter' },
    },
  ];

  const games: Game[] = [
    {
      id: '1',
      title: 'リアル妹がいる大泉くんのばあい',
      coverImage: '/api/placeholder/300/400',
      developer: 'ALcot',
      releaseDate: '2010-05-28',
      playTime: '16h3m',
      rating: 7.1
    },
    {
      id: '2',
      title: 'xxxxxxxxxx1',
      coverImage: '/api/placeholder/300/400',
      developer: 'Example Studio',
      releaseDate: '2023-01-15',
      playTime: '20h',
      rating: 8.2
    },
    // 添加更多游戏数据...
  ];
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
        <GameGrid games={games} />
      </div>
    </div>
  );
};