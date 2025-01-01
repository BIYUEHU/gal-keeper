import type { StateStorage } from 'zustand/middleware'
import { writeTextFile, readTextFile, BaseDirectory } from '@tauri-apps/plugin-fs'
import { getFileNameFromStoreKey, initializeDirectory } from '@/utils'

const tauriStorage: StateStorage = {
  getItem: async (key) => {
    try {
      await initializeDirectory()
      console.log(`Reading file for key ${key}`, getFileNameFromStoreKey(key))
      return await readTextFile(getFileNameFromStoreKey(key), { baseDir: BaseDirectory.AppData })
    } catch (error) {
      console.error(`Failed to read file for key ${key}:`, error)
      return null
    }
  },
  setItem: async (key, value) => {
    try {
      await initializeDirectory()
      await writeTextFile(getFileNameFromStoreKey(key), value, { baseDir: BaseDirectory.AppData })
    } catch (error) {
      console.error(`Failed to write file for key ${key}:`, error)
    }
  },
  removeItem: async (key) => {
    try {
      await initializeDirectory()
      await writeTextFile(getFileNameFromStoreKey(key), '', { baseDir: BaseDirectory.AppData })
    } catch (error) {
      console.error(`Failed to remove file for key ${key}:`, error)
    }
  }
}

export default tauriStorage
