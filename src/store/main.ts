import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { StoreKey } from '@/constant'
import type { CloudChanges, FetchMethods, LocalChanges, LocalData, SortKeys } from '@/types'
import { getStorage } from '@/utils'

export interface AppState {
  local: LocalData[]
  sync: {
    time: number
    localChanges: LocalChanges[]
    cloudChanges: CloudChanges[]
    size: number
    visibility: string
    username: string
    avatar: string
  }
  addLocalChange: (change: LocalChanges) => void
  addCloudChange: (change: CloudChanges) => void
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
  temps: {
    alertIsOpen: boolean
    alertText: string
    alertTitle: string
    fullLoadingIsOpen: boolean
  }
  openAlert: (text: string, title?: string) => void
  closeAlert: () => void
  openFullLoading: () => () => void
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
  }
  getSettingsField: <T extends keyof AppState['settings']>(filed: T) => AppState['settings'][T]
  updateSettings: (settings: Partial<AppState['settings']>) => void
}

export const initialized = {
  local: [],
  sync: {
    time: 0,
    localChanges: [],
    cloudChanges: [],
    size: 0,
    visibility: '',
    username: '',
    avatar: ''
  },
  sidebar: true,
  sort: {
    primaryKey: 'CreateDate' as const,
    isPrimaryDescending: true
  },
  filter: {
    onlyDisplayLocal: false
  },
  temps: {
    alertIsOpen: false,
    alertText: '',
    alertTitle: '',
    fullLoadingIsOpen: false
  },
  settings: {
    githubToken: '',
    githubRepo: '',
    githubPath: 'gal-keeper-data/',
    autoSyncMinutes: 10,
    theme: 'light' as const,
    language: 'zh_CN' as const,
    fetchMethods: 'vndb' as const,
    onlyRecordActiveTime: true,
    autoSetGameTitle: true,
    autoCacheGameCover: true
  }
}

const useStore = create(
  persist<AppState>(
    (set, get): AppState => ({
      ...initialized,
      addLocalChange: (change) =>
        set((state) => ({
          sync: {
            ...state.sync,
            localChanges: [...state.sync.localChanges, change]
          }
        })),
      addCloudChange: (change) =>
        set((state) => ({
          sync: {
            ...state.sync,
            cloudChanges: [...state.sync.cloudChanges, change]
          }
        })),
      toggleSidebar: () => set((state) => ({ sidebar: !state.sidebar })),
      setSort: (sort) => set((state) => ({ sort: { ...state.sort, ...sort } })),
      setFilter: (filter) => set((state) => ({ filter: { ...state.filter, ...filter } })),
      openAlert: (text, title = '提示') =>
        set((state) => ({ temps: { ...state.temps, alertIsOpen: true, alertText: text, alertTitle: title } })),
      closeAlert: () => set((state) => ({ temps: { ...state.temps, alertIsOpen: false } })),
      openFullLoading: () => {
        set((state) => ({ temps: { ...state.temps, fullLoadingIsOpen: true } }))

        return () => {
          set((state) => ({ temps: { ...state.temps, fullLoadingIsOpen: false } }))
        }
      },
      getSettingsField: <T extends keyof AppState['settings']>(filed: T): AppState['settings'][T] =>
        get().settings[filed],
      updateSettings: (settings) => set((state) => ({ settings: { ...state.settings, ...settings } }))
    }),
    {
      name: StoreKey.APP,
      storage: getStorage<AppState>()
    }
  )
)

export default useStore
