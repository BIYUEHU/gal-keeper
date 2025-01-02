import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { StoreKey } from '@/constant'
import type { FetchGameData, FetchMethods, LocalData, SortKeys, Timeline } from '@/types'
import { getStorage } from '@/utils'

export type OperationRecord = {
  id: number
  type: 'add' | 'remove'
} & {
  id: number
  type: 'update'
  data: Partial<FetchGameData>
} & {
  id: number
  type: 'timelines'
  data: Timeline
}

export interface AppState {
  local: LocalData[]
  playTimelines: { id: string; data: Timeline }[]
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
    fullLoadingText: string
    runningPrograms: Record<string, string | undefined>
  }
  openAlert: (text: string, title?: string) => void
  closeAlert: () => void
  openFullLoading: (text: string) => () => void
  isRunning: (program: string) => boolean
  setRunning: (program: string, id: string, state: boolean) => void
  settings: {
    githubToken?: string
    githubUsername?: string
    githubRepo?: string
    githubBranch?: string
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
  playTimelines: [],
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
    fullLoadingIsOpen: false,
    fullLoadingText: '',
    runningPrograms: {}
  },
  settings: {
    theme: 'light' as const,
    language: 'zh_CN' as const,
    fetchMethods: 'vndb' as const,
    onlyRecordActiveTime: true,
    autoSetGameTitle: true,
    // TODO: fix this
    autoCacheGameCover: false
  }
}

const useStore = create(
  persist<AppState>(
    (set, get): AppState => ({
      ...initialized,
      toggleSidebar: () => set((state) => ({ sidebar: !state.sidebar })),
      setSort: (sort) => set((state) => ({ sort: { ...state.sort, ...sort } })),
      setFilter: (filter) => set((state) => ({ filter: { ...state.filter, ...filter } })),
      openAlert: (text, title = '') =>
        set((state) => ({ temps: { ...state.temps, alertIsOpen: true, alertText: text, alertTitle: title } })),
      closeAlert: () => set((state) => ({ temps: { ...state.temps, alertIsOpen: false } })),
      openFullLoading: (text) => {
        set((state) => ({ temps: { ...state.temps, fullLoadingIsOpen: true, fullLoadingText: text } }))

        return () => {
          set((state) => ({ temps: { ...state.temps, fullLoadingIsOpen: false } }))
        }
      },
      isRunning: (program) => !!get().temps.runningPrograms[program],
      setRunning: (program, id, state) => {
        if (state) {
          set((state) => ({
            temps: { ...state.temps, runningPrograms: { ...state.temps.runningPrograms, [program]: id } }
          }))
        } else {
          set((state) => ({
            temps: { ...state.temps, runningPrograms: { ...state.temps.runningPrograms, [program]: undefined } }
          }))
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
