import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { SearchBox } from '@fluentui/react/lib/SearchBox'
import { CommandBar, ICommandBarItemProps } from '@fluentui/react/lib/CommandBar'
import games from '@/data/games.json'
import { SortKeys, SortModal } from '@/components/SortModal'

export const Library: React.FC = () => {
  const [searchText, setSearchText] = useState('')
  const data = games.sort((a, b) => b.id - a.id)
  const [visibleData, setVisibleData] = useState(data)
  const [sortModalIsOpen, setSortModalIsOpen] = useState(false)
  const [primaryKey, setPrimaryKey] = useState<SortKeys>('CreateDate')
  const [isPrimaryDescending, setIsPrimaryDescending] = useState(true)

  useEffect(() =>
    setVisibleData(
      data.filter((game) => {
        const target = searchText.toLocaleLowerCase()
        return [game.title, game.developer].map((str) => str.toLocaleLowerCase().includes(target)).some((bool) => bool)
      })
    )
  )

  useEffect(() => {
    switch (primaryKey) {
      case 'Title':
        setVisibleData(
          visibleData.sort((a, b) =>
            isPrimaryDescending ? b.title.localeCompare(a.title) : a.title.localeCompare(b.title)
          )
        )
        break
      case 'Developer':
        setVisibleData(
          visibleData.sort((a, b) =>
            isPrimaryDescending ? b.developer.localeCompare(a.developer) : a.developer.localeCompare(b.developer)
          )
        )
        break
      case 'LastPlay':
        setVisibleData(
          visibleData.sort((a, b) => (isPrimaryDescending ? b.lastPlay - a.lastPlay : a.lastPlay - b.lastPlay))
        )
        break
      case 'Rating':
        setVisibleData(visibleData.sort((a, b) => (isPrimaryDescending ? b.rating - a.rating : a.rating - b.rating)))
        break
      case 'ReleaseDate':
        setVisibleData(
          visibleData.sort((a, b) =>
            isPrimaryDescending ? b.releaseDate - a.releaseDate : a.releaseDate - b.releaseDate
          )
        )
        break
      case 'CreateDate':
        setVisibleData(
          visibleData.sort((a, b) => (isPrimaryDescending ? b.createDate - a.createDate : a.createDate - b.createDate))
        )
    }
  }, [visibleData, primaryKey, isPrimaryDescending])

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
      onClick: () => setSortModalIsOpen(true)
    },
    {
      key: 'filter',
      text: '筛选',
      iconProps: { iconName: 'Filter' }
    }
  ]

  return (
    <React.Fragment>
      <SortModal
        isOpen={sortModalIsOpen}
        setIsOpen={setSortModalIsOpen}
        primaryKey={primaryKey}
        setPrimaryKey={setPrimaryKey}
        isPrimaryDescending={isPrimaryDescending}
        setIsPrimaryDescending={setIsPrimaryDescending}
      />
      <div className="border-b">
        <div className="flex items-center justify-between mb-5">
          <SearchBox
            placeholder="搜索游戏..."
            value={searchText}
            onChange={(_, newValue) => setSearchText(newValue || '')}
            className="w-80"
          />
          <CommandBar className="relative" items={commandItems} />
        </div>
      </div>
      <div className="overflow-auto grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-9 gap-6">
        {visibleData.map((game) => (
          <Link
            key={game.id}
            to={`/details/${game.id}`}
            className="no-underline p-1 hover:border-solid hover:border-lg hover:border-2 hover:border-gray-100"
          >
            <div className="cursor-pointer">
              <div className="w-full aspect-[3/4] rounded-lg overflow-hidden bg-gray-100">
                <img
                  src={game.cover}
                  alt={game.title}
                  className="w-full h-full object-cover transition-transform group-hover:scale-105"
                />
              </div>
              <div className="">
                <h3 className="text-sm font-medium text-gray-900">{game.title}</h3>
              </div>
            </div>
          </Link>
        ))}
        fdi
      </div>
    </React.Fragment>
  )
}
