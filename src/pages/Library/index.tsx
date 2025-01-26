import React, { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { SearchBox } from '@fluentui/react/lib/SearchBox'
import { CommandBar, type ICommandBarItemProps } from '@fluentui/react/lib/CommandBar'
import { SortModal } from '@/components/SortModal'
import useStore from '@/store'
import { FilterModal } from '@/components/FilterModal'
import { AddModal } from '@/components/AddModal'
import { t } from '@/utils/i18n'

export const Library: React.FC = () => {
  const [modalData, setModalData] = useState({
    isOpenSortModal: false,
    isOpenFilterModal: false,
    isOpenAddModal: false
  })
  const { sortPrimaryKey, sortIsPrimaryDescending, sortOnlyDisplayLocal } = useStore((state) => state.settings)
  const [searchText, setSearchText] = useState('')
  const [games, setGames] = useState(useStore((state) => state.getAllGameData)(false))

  const filteredData = useMemo(() => {
    const target = searchText.toLocaleLowerCase()
    return games.filter(
      (game) =>
        [game.title, game.developer].some((field) => field.toLocaleLowerCase().includes(target)) &&
        (game.local || !sortOnlyDisplayLocal)
    )
  }, [searchText, games, sortOnlyDisplayLocal])

  const sortedData = useMemo(() => {
    const sorted = [...filteredData]
    switch (sortPrimaryKey) {
      case 'Title':
        sorted.sort((a, b) =>
          sortIsPrimaryDescending ? a.title.localeCompare(b.title) : b.title.localeCompare(a.title)
        )
        break
      case 'Developer':
        sorted.sort((a, b) =>
          sortIsPrimaryDescending ? b.developer.localeCompare(a.developer) : a.developer.localeCompare(b.developer)
        )
        break
      case 'LastPlay':
        sorted.sort((a, b) => (sortIsPrimaryDescending ? b.lastPlay - a.lastPlay : a.lastPlay - b.lastPlay))
        break
      case 'Rating':
        sorted.sort((a, b) => (sortIsPrimaryDescending ? b.rating - a.rating : a.rating - b.rating))
        break
      case 'ReleaseDate':
        sorted.sort((a, b) => (sortIsPrimaryDescending ? b.releaseDate - a.releaseDate : a.releaseDate - b.releaseDate))
        break
      case 'CreateDate':
        sorted.sort((a, b) => (sortIsPrimaryDescending ? b.createDate - a.createDate : a.createDate - b.createDate))
        break
    }
    return sorted
  }, [filteredData, sortPrimaryKey, sortIsPrimaryDescending])

  const commandItems: ICommandBarItemProps[] = [
    {
      key: 'add',
      text: t`page.library.command.add`,
      iconProps: { iconName: 'Add' },
      onClick: () => setModalData((prev) => ({ ...prev, isOpenAddModal: true }))
    },
    {
      key: 'sort',
      text: t`page.library.command.sort`,
      iconProps: { iconName: 'Sort' },
      onClick: () => setModalData((prev) => ({ ...prev, isOpenSortModal: true }))
    },
    {
      key: 'filter',
      text: t`page.library.command.filter`,
      iconProps: { iconName: 'Filter' },
      onClick: () => setModalData((prev) => ({ ...prev, isOpenFilterModal: true }))
    }
  ]

  return (
    <React.Fragment>
      <AddModal
        isOpen={modalData.isOpenAddModal}
        setIsOpen={() => setModalData((prev) => ({ ...prev, isOpenAddModal: false }))}
        data={games}
        setData={setGames}
      />
      <SortModal
        isOpen={modalData.isOpenSortModal}
        setIsOpen={() => setModalData((prev) => ({ ...prev, isOpenSortModal: false }))}
      />
      <FilterModal
        isOpen={modalData.isOpenFilterModal}
        setIsOpen={() => setModalData((prev) => ({ ...prev, isOpenFilterModal: false }))}
      />
      <div className="border-b">
        <div className="flex items-center justify-between mb-5">
          <SearchBox
            placeholder={t`page.library.search.placeholder`}
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
