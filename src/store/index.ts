import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import { IS_TAURI, StoreKey } from '@/constant'
import type { GameData, GameWithLocalData, FetchMethods, LocalData, SortKeys, Group, Category } from '@/types'
import tauriStorage from '@/utils/tauriStorage'
import events from '@/utils/events'

export interface RootState {
  gameData: GameData[]
  localData: LocalData[]
  groups: Group[]
  categories: Category[]
  sync: {
    time: number
    deleteIds: string[]
    size: number
    visibility: string
    username: string
    avatar: string
  }
  settings: {
    githubToken: string
    githubRepo: string
    githubPath: string
    autoSyncMinutes: number
    theme: 'light' | 'dark'
    language: 'en_US' | 'zh_CN' | 'ja_JP' | 'zh_TW'
    fetchMethods: FetchMethods
    onlyRecordActiveTime: boolean
    autoSetGameTitle: boolean
    autoCacheGameCover: boolean
    sortOnlyDisplayLocal: boolean
    sortPrimaryKey: SortKeys
    sortIsPrimaryDescending: boolean
  }
}

type RootStateMethods = {
  isRunningGame(id: string): boolean
  increasePlayTimeline(id: string, startTime: number, endTime: number): void
  addGroup(name: string): void
  deleteGroup(id: string): void
  addCategory(groupId: string, name: string): void
  deleteCategory(id: string): void
  addGameData(data: GameWithLocalData): void
  updateGameData(data: GameWithLocalData): void
  removeGameData(id: string, onlyLocal: boolean): void
  getGameData(id: string): GameWithLocalData | undefined
  getAllGameData<T extends boolean>(isPure: T): (true extends T ? GameData : GameWithLocalData)[]
  // getGameDataByProgramFile(programFile: string) : GameWithLocalData | undefined
  updateSettings(settings: Partial<RootState['settings']>): void
}

const initialState: RootState = {
  gameData: [],
  localData: [],
  groups: [],
  categories: [],
  sync: {
    time: 0,
    deleteIds: [],
    size: 0,
    visibility: '',
    username: '',
    avatar: ''
  },
  settings: {
    githubToken: '',
    githubRepo: '',
    githubPath: 'gal-keeper-data/',
    autoSyncMinutes: 10,
    theme: 'light',
    language: 'zh_CN',
    fetchMethods: 'vndb',
    onlyRecordActiveTime: true,
    autoSetGameTitle: true,
    autoCacheGameCover: true,
    sortOnlyDisplayLocal: false,
    sortPrimaryKey: 'CreateDate',
    sortIsPrimaryDescending: true
  }
}

const useStore = create(
  persist<RootState & RootStateMethods>(
    (set, get) => ({
      ...initialState,

      isRunningGame(id) {
        return (
          Date.now() / 1000 -
            (get()
              .getGameData(id)
              ?.playTimelines.reduce((acc, cur) => (acc > cur[1] ? acc : cur[1]), 0) ?? 0) <
          3
        )
      },

      increasePlayTimeline(id, startTime, endTime) {
        set((state) => ({
          gameData: state.gameData.map((item) =>
            item.id === id
              ? {
                  ...item,
                  playTimelines: ((index) =>
                    index === -1
                      ? [...item.playTimelines, [startTime, endTime, 1]]
                      : [
                          ...item.playTimelines.slice(0, index),
                          [startTime, endTime, item.playTimelines[index][2] + 1],
                          ...item.playTimelines.slice(index + 1)
                        ])(item.playTimelines.findIndex((timeline) => timeline[0] === startTime))
                }
              : item
          )
        }))
        events.emit('updateGame', id)
      },

      addGameData(data) {
        const { local, ...game } = data
        set((state) => ({
          gameData: [...state.gameData, { ...game, updateDate: Date.now() / 1000 }],
          ...(local && IS_TAURI
            ? {
                localData: [...state.localData, local]
              }
            : {})
        }))
        events.emit('updateGame', data.id)
      },

      updateGameData(data) {
        const { local, ...game } = data
        set((state) => ({
          gameData: state.gameData.map((item) =>
            item.id === data.id ? { ...game, updateDate: Date.now() / 1000 } : item
          ),
          ...(local && IS_TAURI
            ? { localData: state.localData.map((item) => (item.id === data.id ? { ...item, ...local } : item)) }
            : {})
        }))
        events.emit('updateGame', data.id)
      },

      removeGameData(id, onlyLocal) {
        set((state) => ({
          gameData: onlyLocal ? state.gameData : state.gameData.filter((item) => item.id !== id),
          ...(IS_TAURI
            ? {
                localData: state.localData.filter((item) => item.id !== id)
              }
            : {}),
          sync: {
            ...state.sync,
            deleteIds: onlyLocal ? [...state.sync.deleteIds, id] : state.sync.deleteIds
          }
        }))
        events.emit('updateGame', id)
      },

      addGroup(name) {
        const id = crypto.randomUUID()
        set((state) => ({
          groups: [...state.groups, { id, name, categoryIds: [] }]
        }))
      },
      deleteGroup(id) {
        set((state) => ({
          groups: state.groups.filter((group) => group.id !== id)
        }))
      },
      addCategory(groupId, name) {
        const id = crypto.randomUUID()
        set((state) => ({
          categories: [...state.categories, { id, name, gameIds: [] }],
          groups: state.groups.map((group) =>
            group.id === groupId ? { ...group, categoryIds: [...group.categoryIds, id] } : group
          )
        }))
      },
      deleteCategory(id) {
        set((state) => ({
          categories: state.categories.filter((category) => category.id !== id),
          groups: state.groups.map((group) => ({
            ...group,
            categoryIds: group.categoryIds.filter((categoryId) => categoryId !== id)
          }))
        }))
      },

      getGameData(id) {
        const gameData = get().gameData.find((item) => item.id === id)
        if (!gameData) return undefined

        return {
          ...gameData,
          local: get().localData.find((local) => local.id === id)
        }
      },

      getAllGameData(isPure) {
        const { gameData, localData } = get()
        if (isPure) return gameData

        return gameData.map((item) => ({
          ...item,
          local: localData.find((l) => l.id === item.id)
        }))
      },

      // getGameDataByProgramFile(programFile) {
      //   const id = get().localData.find((item) => item.programFile === programFile)?.id
      //   return id ? get().getGameData(id) : undefined
      // },

      // openAlert(text, title = '提示') {
      //   set((state) => ({
      //     temps: {
      //       ...state.temps,
      //       alertIsOpen: true,
      //       alertText: text,
      //       alertTitle: title
      //     }
      //   }))
      // },

      // closeAlert() {
      //   set((state) => ({
      //     temps: {
      //       ...state.temps,
      //       alertIsOpen: false
      //     }
      //   }))
      // },

      // openFullLoading() {
      //   set((state) => ({
      //     temps: {
      //       ...state.temps,
      //       fullLoadingIsOpen: true
      //     }
      //   }))

      //   return () => {
      //     set((state) => ({
      //       temps: {
      //         ...state.temps,
      //         fullLoadingIsOpen: false
      //       }
      //     }))
      //   }
      // },

      // getSettingsField(field) {
      //   return get().settings[field]
      // },

      updateSettings(settings) {
        set((state) => ({
          settings: {
            ...state.settings,
            ...settings
          }
        }))
      }
    }),
    {
      name: StoreKey.APP,
      storage: IS_TAURI ? createJSONStorage(() => tauriStorage) : createJSONStorage(() => localStorage)
    }
  )
)

export default useStore

// export * from './main'
// export * from './shared'

// export default useStore
