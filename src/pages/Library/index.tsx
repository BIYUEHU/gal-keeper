import { useState } from 'react'
import SortModal from '@/components/SortModal'
import useStore from '@/store'
import FilterModal from '@/components/FilterModal'
import AddModal from '@/components/AddModal'
import { t } from '@/utils/i18n'
import GameList from '@/components/GameList'
import type { ICommandBarItemProps } from '@fluentui/react'

const Library: React.FC = () => {
  const [modalData, setModalData] = useState({
    isOpenSortModal: false,
    isOpenFilterModal: false,
    isOpenAddModal: false
  })
  const [games, setGames] = useState(useStore((state) => state.getAllGameData)(false))

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
    <GameList games={games} commandItems={commandItems}>
      <AddModal
        isOpen={modalData.isOpenAddModal}
        setIsOpen={() => setModalData((prev) => ({ ...prev, isOpenAddModal: false }))}
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
    </GameList>
  )
}

export default Library
