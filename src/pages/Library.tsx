import React, { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { SearchBox } from '@fluentui/react/lib/SearchBox'
import { CommandBar, type ICommandBarItemProps } from '@fluentui/react/lib/CommandBar'
import { SortModal } from '@/components/SortModal'
import useStore, { useSharedStore } from '@/store'
import { FilterModal } from '@/components/FilterModal'
import { AddModal } from '@/components/AddModal'

export const Library: React.FC = () => {
  const [isOpenSortModal, setIsOpenSortModal] = useState(false)
  const [isOpenFilterModal, setIsOpenFilterModal] = useState(false)
  const [isOpenAddModal, setIsOpenAddModal] = useState(false)

  const { primaryKey, isPrimaryDescending } = useStore((state) => state.sort)
  const { onlyDisplayLocal } = useStore((state) => state.filter)
  const [searchText, setSearchText] = useState('')
  const [games, setGames] = useState(useSharedStore((state) => state.getAllData)())

  const filteredData = useMemo(() => {
    const target = searchText.toLocaleLowerCase()
    return games.filter(
      (game) =>
        [game.title, game.developer].some((field) => field.toLocaleLowerCase().includes(target)) &&
        (game.local || !onlyDisplayLocal)
    )
  }, [searchText, games, onlyDisplayLocal])

  const sortedData = useMemo(() => {
    const sorted = [...filteredData]
    switch (primaryKey) {
      case 'Title':
        sorted.sort((a, b) => (isPrimaryDescending ? a.title.localeCompare(b.title) : b.title.localeCompare(a.title)))
        break
      case 'Developer':
        sorted.sort((a, b) =>
          isPrimaryDescending ? b.developer.localeCompare(a.developer) : a.developer.localeCompare(b.developer)
        )
        break
      case 'LastPlay':
        sorted.sort((a, b) => (isPrimaryDescending ? b.lastPlay - a.lastPlay : a.lastPlay - b.lastPlay))
        break
      case 'Rating':
        sorted.sort((a, b) => (isPrimaryDescending ? b.rating - a.rating : a.rating - b.rating))
        break
      case 'ReleaseDate':
        sorted.sort((a, b) => (isPrimaryDescending ? b.releaseDate - a.releaseDate : a.releaseDate - b.releaseDate))
        break
      case 'CreateDate':
        sorted.sort((a, b) => (isPrimaryDescending ? b.createDate - a.createDate : a.createDate - b.createDate))
        break
    }
    return sorted
  }, [filteredData, primaryKey, isPrimaryDescending])

  const commandItems: ICommandBarItemProps[] = [
    {
      key: 'add',
      text: '添加游戏',
      iconProps: { iconName: 'Add' },
      onClick: () => setIsOpenAddModal(true)
    },
    {
      key: 'sort',
      text: '排序',
      iconProps: { iconName: 'Sort' },
      onClick: () => setIsOpenSortModal(true)
    },
    {
      key: 'filter',
      text: '筛选',
      iconProps: { iconName: 'Filter' },
      onClick: () => setIsOpenFilterModal(true)
    }
  ]

  return (
    <React.Fragment>
      <AddModal isOpen={isOpenAddModal} setIsOpen={setIsOpenAddModal} data={games} setData={setGames} />
      <SortModal isOpen={isOpenSortModal} setIsOpen={setIsOpenSortModal} />
      <FilterModal isOpen={isOpenFilterModal} setIsOpen={setIsOpenFilterModal} />
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
      <div className="overflow-auto grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-9">
        {sortedData.map((game) => (
          <Link
            key={game.id}
            to={`/details/${game.id}`}
            className="ml-1 relative my-2 max-w-40 no-underline p-1 border-transparent box-border hover:border-solid hover:border-2 hover:border-gray-200 hover:bg-gray-50 hover:scale-105"
          >
            <div className="cursor-pointer relative">
              <div className="aspect-[3/4] rounded-lg overflow-hidden bg-gray-100 relative">
                {/* blue: cloud */}
                {!game.local && (
                  <div className="absolute border-t-solid border-t-20 border-t-sky border-r-solid border-r-20 border-r-transparent" />
                )}
                <img
                  src={game.cover || '/assets/cover.png'}
                  alt=""
                  className="w-full h-full object-cover transition-transform"
                />
              </div>
              <h3 className="text-sm font-medium text-gray-900 mt-1 truncate">{game.title}</h3>
            </div>
          </Link>
        ))}
      </div>
    </React.Fragment>
  )
}
