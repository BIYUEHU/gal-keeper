import ConfirmBox from '@/components/ConfirmBox'
import GameList from '@/components/GameList'
import GroupModal from '@/components/GroupModal'
import InsertModal from '@/components/InsertModal'
import { useUI } from '@/contexts/UIContext'
import useStore from '@/store'
import { DefaultGroup, type GameData, type Category as CategoryType, type Group } from '@/types'
import { calculateTotalPlayTime } from '@/utils'
import i18n, { t } from '@/utils/i18n'
import { CommandBar, type ICommandBarItemProps, IconButton } from '@fluentui/react'
import React, { useMemo, useState } from 'react'
import { Link, Navigate, useParams } from 'react-router-dom'

const DEFAULT_GROUPS: Group[] = [
  {
    id: DefaultGroup.DEVELOPER,
    name: t`page.category.default.developer.title`,
    categoryIds: []
  },
  {
    id: DefaultGroup.RATING,
    name: t`page.category.default.rating.title`,
    categoryIds: []
  },
  {
    id: DefaultGroup.PLAY_STATE,
    name: t`page.category.default.playStatus.title`,
    categoryIds: []
  }
]

function isDefaultGroup(id: string): id is DefaultGroup {
  return ([DefaultGroup.DEVELOPER, DefaultGroup.RATING, DefaultGroup.PLAY_STATE] as string[]).includes(id)
}

function generateDefaultCategories(id: string, games: GameData[]): CategoryType[] | undefined {
  return id.startsWith(DefaultGroup.DEVELOPER)
    ? Object.entries(
        games.reduce(
          (acc, game) =>
            game.developer
              ? {
                  // biome-ignore lint:
                  ...acc,
                  [game.developer]: game.developer in acc ? [...acc[game.developer], game.id] : [game.id]
                }
              : acc,
          {} as Record<string, string[]>
        )
      ).map(([name, gameIds]) => ({
        id: `${DefaultGroup.DEVELOPER}_${name}`,
        name,
        gameIds
      }))
    : id.startsWith(DefaultGroup.RATING)
      ? games
          .reduce(
            (acc, game) =>
              game.rating >= 8
                ? [...acc.slice(0, 4), [...acc[4], game.id]]
                : game.rating >= 6
                  ? [...acc.slice(0, 3), [...acc[3], game.id], acc[4]]
                  : game.rating >= 4
                    ? [...acc.slice(0, 2), [...acc[2], game.id], ...acc.slice(3)]
                    : game.rating >= 2
                      ? [acc[0], [...acc[1], game.id], ...acc.slice(2)]
                      : game.rating > 0
                        ? [[...acc[0], game.id], ...acc.slice(1)]
                        : acc,
            new Array(5).fill([])
          )
          .map((gameIds, index) => ({
            id: `${DefaultGroup.RATING}_${index + 1}`,
            name: i18n.locale(`page.category.default.rating.${index + 1}`),
            gameIds
          }))
          .reverse()
      : id.startsWith(DefaultGroup.PLAY_STATE)
        ? games
            .reduce(
              (acc, game) =>
                ((real, expect) =>
                  expect <= 0
                    ? acc
                    : real >= expect
                      ? [...acc.slice(0, 2), [...acc[2], game.id]]
                      : real > 0
                        ? [acc[0], [...acc[1], game.id], acc[2]]
                        : [[...acc[0], game.id], ...acc.slice(1)])(
                  calculateTotalPlayTime(game.playTimelines),
                  game.expectedPlayHours * 60
                ),
              new Array(3).fill([])
            )
            .map((gameIds, index) => ({
              id: `${DefaultGroup.PLAY_STATE}_${index + 1}`,
              name: i18n.locale(`page.category.default.playStatus.${index + 1}`),
              gameIds
            }))
        : undefined
}

const Category: React.FC = () => {
  const { id } = useParams()
  const [modalData, setModalData] = useState({
    isOpenGroupModal: false,
    isOpenCategoryModal: false,
    isOpenDeleteModal: false,
    isOpenDeleteModal2: null as string | null,
    isOpenInsertModal: false
  })
  const { deleteGroup, deleteCategory, getAllGameData } = useStore((state) => state)
  const [groups, setGroups] = useState(useStore((state) => state.groups))
  const [categories, setCategories] = useState(useStore((state) => state.categories))
  const {
    state: { currentGroupId },
    setCurrentGroupId
  } = useUI()
  const allGames = useMemo(() => getAllGameData(false), [getAllGameData])
  const currentGroups = useMemo(
    () => (isDefaultGroup(currentGroupId) ? undefined : groups.find((group) => group.id === currentGroupId)),
    [currentGroupId, groups]
  )
  const currentCategories = useMemo(
    () =>
      generateDefaultCategories(currentGroupId, allGames) ??
      categories.filter((category) => currentGroups?.categoryIds.includes(category.id)),
    [categories, currentGroupId, allGames, currentGroups]
  )

  if (!id) {
    const commandItems: ICommandBarItemProps[] = [
      {
        key: 'switchGroup',
        text: t`page.category.command.switchGroup`,
        iconProps: { iconName: 'Switcher' },
        subMenuProps: {
          items: [...DEFAULT_GROUPS, ...groups].map((group) => ({
            key: group.id,
            text: group.name,
            onClick: () => setCurrentGroupId(group.id)
          }))
        }
      },
      {
        key: 'addGroup',
        text: t`page.category.command.addGroup`,
        iconProps: { iconName: 'Add' },
        onClick: () => setModalData((prev) => ({ ...prev, isOpenGroupModal: true }))
      },
      {
        key: 'addCategory',
        text: t`page.category.command.addCategory`,
        iconProps: { iconName: 'Add' },
        disabled: !currentGroups,
        onClick: () => setModalData((prev) => ({ ...prev, isOpenCategoryModal: true }))
      },
      {
        key: 'deleteGroup',
        text: t`page.category.command.deleteGroup`,
        iconProps: { iconName: 'Delete' },
        disabled: !currentGroups,
        onClick: () => setModalData((prev) => ({ ...prev, isOpenDeleteModal: true }))
      }
    ]

    return (
      <React.Fragment>
        <GroupModal
          isOpen={modalData.isOpenGroupModal}
          setIsOpen={() => setModalData((prev) => ({ ...prev, isOpenGroupModal: false }))}
          groupId={undefined}
          setData={setGroups}
        />
        <GroupModal
          isOpen={modalData.isOpenCategoryModal}
          setIsOpen={() => setModalData((prev) => ({ ...prev, isOpenCategoryModal: false }))}
          groupId={currentGroupId}
          setData={(...args: Parameters<typeof setCategories>) => {
            setGroups(useStore.getState().groups)
            setCategories(...args)
          }}
        />
        <ConfirmBox
          isOpen={modalData.isOpenDeleteModal}
          setIsOpen={(isOpen) => setModalData({ ...modalData, isOpenDeleteModal: isOpen })}
          text={t`page.category.confirm.group`}
          onConfirm={() => {
            setTimeout(() => {
              setCurrentGroupId(DefaultGroup.DEVELOPER)
              deleteGroup(currentGroupId)
              setGroups(useStore.getState().groups)
            }, 0)
          }}
        />
        <ConfirmBox
          isOpen={!!modalData.isOpenDeleteModal2}
          setIsOpen={() => setModalData({ ...modalData, isOpenDeleteModal2: null })}
          text={t`page.category.confirm.category`}
          onConfirm={() => {
            setTimeout(() => {
              if (typeof modalData.isOpenDeleteModal2 === 'string') {
                deleteCategory(modalData.isOpenDeleteModal2)
                setGroups(useStore.getState().groups)
              }
            }, 0)
          }}
        />
        <div className="border-b">
          <div className="flex items-center justify-between mb-5">
            <div />
            <CommandBar className="relative" items={commandItems} />
          </div>
        </div>
        <div className="overflow-auto grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-8">
          {currentCategories.map((category) => (
            <Link
              key={category.id}
              to={`/category/${category.id}`}
              className="ml-2 relative my-2 max-w-40 no-underline p-1 min-h-25 border-transparent box-border rounded-lg bg-gray-50 hover:bg-gray-100 "
            >
              <div className="flex flex-col justify-between h-full">
                <div className="flex items-center justify-between">
                  <div className="text-gray-900 text-lg ">{category.name}</div>
                  {currentGroups && (
                    <IconButton
                      iconProps={{ iconName: 'Delete' }}
                      onClick={(e) => {
                        e.preventDefault()
                        setModalData({ ...modalData, isOpenDeleteModal2: category.id })
                      }}
                    />
                  )}
                </div>
                <div>
                  <span className="mx-1 px-2 my-2 text-sm text-gray-100 rounded-lg bg-gray-300">
                    x{category.gameIds.length}
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </React.Fragment>
    )
  }

  const category = (generateDefaultCategories(id, allGames) ?? categories).find((g) => g.id === id)

  if (!category) return <Navigate to="/category" />
  const games = allGames.filter((game) => category.gameIds.includes(game.id))

  const commandItems: ICommandBarItemProps[] = [
    {
      key: 'insertGame',
      text: t`page.category.command.insertGame`,
      iconProps: { iconName: 'Add' },
      disabled: !currentGroups,
      onClick: () => setModalData((prev) => ({ ...prev, isOpenInsertModal: true }))
    }
  ]

  return (
    <GameList games={games} commandItems={commandItems}>
      <InsertModal
        isOpen={modalData.isOpenInsertModal}
        setIsOpen={() => setModalData((prev) => ({ ...prev, isOpenInsertModal: false }))}
        data={category}
        setData={setCategories}
      />
    </GameList>
  )
}

export default Category
