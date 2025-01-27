import GameList from '@/components/GameList'
import useStore from '@/store'
import { t } from '@/utils/i18n'
import { CommandBar, type ICommandBarItemProps, IconButton } from '@fluentui/react'
import React, { useState } from 'react'
import { Link, Navigate, useParams } from 'react-router-dom'

const Category: React.FC = () => {
  const { id } = useParams()
  const [modalData, setModalData] = useState({
    isOpenGroupModal: false,
    isOpenCategoryModal: false
  })
  const { groups, categories, deleteGroup, deleteCategory } = useStore((state) => state)

  if (!id) {
    const commandItems: ICommandBarItemProps[] = [
      {
        key: 'addGroup',
        text: t`page.category.command.addGroup`,
        iconProps: { iconName: 'Add' },
        onClick: () => setModalData((prev) => ({ ...prev, isOpenGroupModal: true }))
      }
    ]

    return (
      <React.Fragment>
        {/* <GroupModal
          isOpen={modalData.isOpenGroupModal}
          setIsOpen={() => setModalData((prev) => ({ ...prev, isOpenGroupModal: false }))}
        /> */}
        <div className="border-b">
          <div className="flex items-center justify-between mb-5">
            <div />
            <CommandBar className="relative" items={commandItems} />
          </div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-8 gap-4">
          {groups.map((group) => (
            <Link
              key={group.id}
              to={`/category/${group.id}`}
              className="relative p-4 bg-gray-50 rounded-lg hover:bg-gray-100"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium">{group.name}</h3>
                <IconButton
                  iconProps={{ iconName: 'Delete' }}
                  onClick={(e) => {
                    e.preventDefault()
                    if (confirm(t`page.category.confirmDeleteGroup`)) {
                      deleteGroup(group.id)
                    }
                  }}
                />
              </div>
              <div className="mt-2 text-sm text-gray-500">
                {group.categoryIds.length} {t`page.category.categories`}
              </div>
            </Link>
          ))}
        </div>
      </React.Fragment>
    )
  }

  const group = groups.find((g) => g.id === id)
  if (!group) return <Navigate to="/category" />

  const groupCategories = categories.filter((category) => group.categoryIds.includes(category.id))
  const games = useStore((state) => state.getAllGameData)(false).filter((game) =>
    groupCategories.some((category) => category.gameIds.includes(game.id))
  )

  const commandItems: ICommandBarItemProps[] = [
    {
      key: 'addCategory',
      text: t`page.category.command.addCategory`,
      iconProps: { iconName: 'Add' },
      onClick: () => setModalData((prev) => ({ ...prev, isOpenCategoryModal: true }))
    }
  ]

  return (
    <GameList games={games} commandItems={commandItems}>
      {/* <CategoryModal
        isOpen={modalData.isOpenCategoryModal}
        setIsOpen={() => setModalData((prev) => ({ ...prev, isOpenCategoryModal: false }))}
        groupId={id}
      /> */}
      <div className="mb-4">
        <Link to="/category" className="text-blue-500 hover:text-blue-700">
          {t`common.back`}
        </Link>
        <h2 className="text-2xl font-bold mt-2">{group.name}</h2>
      </div>
    </GameList>
  )
}

export default Category
