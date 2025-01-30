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
  cache: {
    [url: string]: string
  }
  settings: {
    githubToken: string
    githubRepo: string
    githubPath: string
    autoSyncMinutes: number
    theme: 'light' | 'dark'
    language: 'en_US' | 'zh_CN' | 'ja_JP' | 'zh_TW'
    fetchMethods: FetchMethods
    maxTimelineDisplayCount: number
    autoSetGameTitle: boolean
    autoCacheImage: boolean
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
  updateCategory(id: string, ids: string[]): void
  deleteCategory(id: string): void
  addGameData(data: GameWithLocalData): void
  updateGameData(data: GameWithLocalData): void
  removeGameData(id: string, onlyLocal: boolean): void
  getGameData(id: string): GameWithLocalData | undefined
  importGameData(data: GameData[]): void
  getAllGameData<T extends boolean>(isPure: T): (true extends T ? GameData : GameWithLocalData)[]
  updateSettings(settings: Partial<RootState['settings']>): void
  addCache(url: string, file: string): void
  getCache(url: string): string | undefined
  removeCache(url: string): void
}

export const initialState: RootState = {
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
  cache: {},
  settings: {
    githubToken: '',
    githubRepo: '',
    githubPath: 'gal-keeper-data/',
    autoSyncMinutes: 10,
    theme: 'light',
    language: 'zh_CN',
    fetchMethods: 'vndb',
    maxTimelineDisplayCount: 50,
    autoSetGameTitle: true,
    autoCacheImage: true,
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
              ?.playTimelines.reduce((acc, cur) => Math.max(acc, cur[1]), 0) ?? 0) <
          3
        )
      },
      increasePlayTimeline(id, startTime, endTime) {
        set((state) => ({
          gameData: state.gameData.map((item) =>
            item.id === id
              ? {
                  ...item,
                  lastPlay: endTime * 1000,
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
          gameData: [...state.gameData, { ...game }],
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
          gameData: onlyLocal
            ? state.gameData
            : state.gameData.filter((item) => {
                if (item.id !== id) return true
                if (item.cover) get().removeCache(item.cover)
                return false
              }),
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
      updateCategory(id, ids) {
        set((state) => ({
          categories: state.categories.map((category) =>
            category.id === id ? { ...category, gameIds: ids } : category
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
      importGameData(data) {
        set((state) => ({
          gameData: [...state.gameData.filter((item) => !data.some((d) => d.id === item.id)), ...data],
          localData: state.localData.filter((item) => data.some((d) => d.id === item.id))
        }))
      },
      updateSettings(settings) {
        set((state) => ({
          settings: {
            ...state.settings,
            ...settings
          }
        }))
      },
      addCache(url, file) {
        set((state) => ({
          cache: {
            ...state.cache,
            [url]: file
          }
        }))
      },
      getCache(url) {
        return get().cache[url]
      },
      removeCache(url) {
        const { cache } = get()
        delete cache[url]
        set(() => ({
          cache
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
