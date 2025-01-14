import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { IS_TAURI, StoreKey } from '@/constant'
import type { GameData, GameWithLocalData, Timeline } from '@/types'
import { getStorage } from '@/utils'
import useStore from './main'

export interface SharedState {
  data: GameData[]
  initialize: () => void
  addPlayTimeline: (id: string, data: Timeline) => void
  addData: (data: GameWithLocalData) => void
  updateData: (data: GameWithLocalData) => void
  removeData: (id: string, onlyLocal: boolean) => void
  getData(id: string): GameWithLocalData | undefined
  getAllData: <T extends boolean>(isPure: T) => (true extends T ? GameData : GameWithLocalData)[]
  getDataByProgramFile: (programFile: string) => GameWithLocalData | undefined
}

export const useSharedStore = create(
  persist<SharedState>(
    (set, get): SharedState => ({
      data: [],
      initialize: () => {
        // const idList = get().data.map((item) => item.id)
        // const clear = <T extends { id: string } & M, M extends object>({ id }: T) => idList.includes(id)
        // useStore.setState((state) => ({
        //   ...state,
        //   temps: initialized.temps,
        //   local: state.local.filter(clear)
        // }))
      },
      addPlayTimeline: (id, data) => {
        set((state) => ({
          data: state.data.map((item) =>
            item.id === id ? { ...item, palyTimelines: [...item.palyTimelines, data] } : item
          )
        }))
        useStore.getState().addLocalChange({ id, type: 'timelines', data })
      },
      addData: (data) => {
        const { local, ...game } = data
        set((state) => ({ data: [...state.data, game] }))

        useStore.getState().addLocalChange({ id: data.id, type: 'add' })

        if (local && IS_TAURI) {
          useStore.setState((state) => ({ local: [...state.local, local] }))
        }
      },
      updateData: (data) => {
        const { local, ...game } = data
        set((state) => ({ data: state.data.map((item) => (item.id === data.id ? game : item)) }))

        useStore.getState().addLocalChange({ id: data.id, type: 'update' })

        if (local && IS_TAURI) {
          if (useStore.getState().local.some((item) => item.id === data.id)) {
            useStore.setState((state) => ({
              local: state.local.map((item) => (item.id === data.id ? { ...item, ...local } : item))
            }))
          } else {
            useStore.setState((state) => ({ local: [...state.local, local] }))
          }
        }
      },
      removeData: (id, onlyLocal) => {
        if (!onlyLocal) {
          set((state) => ({ data: state.data.filter((item) => item.id !== id) }))
          useStore.getState().addLocalChange({ id, type: 'remove' })
        }

        if (IS_TAURI) useStore.setState((state) => ({ local: state.local.filter((item) => item.id !== id) }))
      },
      getData: (id) => {
        const localData = useStore.getState().local
        const data = get().data.find((item) => item.id === id)

        if (data) {
          return {
            ...data,
            local: localData.find((local) => local.id === id)
          }
        }
        return undefined
      },
      getAllData: (isPure) => {
        const { data } = get()
        if (isPure) {
          return data
        }

        const localData = useStore.getState().local

        return data.map(
          (item): GameWithLocalData => ({
            ...item,
            local: localData.find((local) => local.id === item.id)
          })
        )
      },
      getDataByProgramFile: (programFile) => {
        const id = useStore.getState().local.find((item) => item.programFile === programFile)?.id
        return id ? get().getData(id) : undefined
      }
    }),
    {
      name: StoreKey.SHARED,
      storage: getStorage<SharedState>()
    }
  )
)
