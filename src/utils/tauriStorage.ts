import type { StateStorage } from 'zustand/middleware'
import { getFileNameFromStoreKey } from '@/utils'
import { invoke } from '@tauri-apps/api/core'
import { appDataDir } from '@tauri-apps/api/path'

const tauriStorage: StateStorage = {
  getItem: async (key) => {
    try {
      // await initializeDirectory()
      const data = await invoke('db_read_value', {
        directory: await appDataDir(),
        file: getFileNameFromStoreKey(key),
        key
      })
      console.log(`Read file for key ${key}:`, data)
      return data as string
    } catch (error) {
      console.error(`Failed to read file for key ${key}:`, error)
      return null
    }
  },
  setItem: async (key, value) => {
    try {
      // await initializeDirectory()
      await invoke('db_write_value', { directory: await appDataDir(), file: getFileNameFromStoreKey(key), key, value })
    } catch (error) {
      console.error(`Failed to write file for key ${key}:`, error)
    }
  },
  removeItem: async (key) => {
    try {
      // await initializeDirectory()
      await invoke('db_remove_value', { directory: await appDataDir(), file: getFileNameFromStoreKey(key), key })
    } catch (error) {
      console.error(`Failed to remove file for key ${key}:`, error)
    }
  }
}

export default tauriStorage
