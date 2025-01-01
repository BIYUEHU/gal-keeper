import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { SortKeys } from '@/components/SortModal'
import { StoreKey } from '@/constant'
import type { GameData, GameWithLocalData, LocalData } from '@/types'
import { getStorage } from '@/utils'

export interface AppState {
  local: LocalData[]
  sidebar: boolean
  toggleSidebar: () => void
  sort: {
    primaryKey: SortKeys
    isPrimaryDescending: boolean
  }
  filter: {
    onlyDisplayLocal: boolean
  }
  setSort: (sort: Partial<AppState['sort']>) => void
  setFilter: (filter: Partial<AppState['filter']>) => void
  theme: 'light' | 'dark'
  setTheme: (theme: AppState['theme']) => void
  language: 'en_US' | 'zh_CN' | 'ja_JP' | 'zh_TW'
  setLanguage: (language: AppState['language']) => void
}

export const initialized = {
  local: [],
  sidebar: true,
  sort: {
    primaryKey: 'CreateDate' as const,
    isPrimaryDescending: false
  },
  filter: {
    onlyDisplayLocal: false
  },
  theme: 'light' as const,
  language: 'en_US' as const
}

const useStore = create(
  persist<AppState>(
    (set): AppState => ({
      ...initialized,
      toggleSidebar: () => set((state) => ({ sidebar: !state.sidebar })),
      setSort: (sort) => set((state) => ({ sort: { ...state.sort, ...sort } })),
      setFilter: (filter) => set((state) => ({ filter: { ...state.filter, ...filter } })),
      setTheme: (theme) => set({ theme }),
      setLanguage: (language: AppState['language']) => set({ language })
    }),
    {
      name: StoreKey.APP,
      storage: getStorage<AppState>()
    }
  )
)

export interface SharedState {
  data: GameData[]
  getNewId: () => number
  addData: (data: GameWithLocalData) => void
  updateData: (data: GameWithLocalData) => void
  removeData: (id: number) => void
  getAllData: () => GameWithLocalData[]
}

export const useSharedState = create(
  persist<SharedState>(
    (set, get): SharedState => ({
      data: [],
      getNewId: () => get().data.length + 1,
      addData: (data) => {
        const { local, ...game } = data
        set((state) => ({ data: [...state.data, game] }))

        if (local) {
          useStore.setState((state) => ({ local: [...state.local, local] }))
        }
      },
      updateData: (data) => {
        const { local, ...game } = data
        set((state) => ({ data: state.data.map((item) => (item.id === data.id ? game : item)) }))
        if (local) {
          useStore.setState((state) => ({
            local: state.local.map((item) => (item.id === data.id ? local : item))
          }))
        }
      },
      removeData: (id) => {
        set((state) => ({ data: state.data.filter((item) => item.id !== id) }))
        useStore.setState((state) => ({ local: state.local.filter((item) => item.id !== id) }))
      },
      getAllData: () => {
        const localData = useStore.getState().local
        return get().data.map((item): GameWithLocalData => {
          const local = localData.find((local) => local.id === item.id)
          return {
            ...item,
            ...local
          }
        })
      }
    }),
    {
      name: StoreKey.SHARED,
      storage: getStorage<SharedState>()
    }
  )
)

export default useStore
