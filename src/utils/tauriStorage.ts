import type { StateStorage } from 'zustand/middleware'
import { appDataDir } from '@tauri-apps/api/path'
import { invoke } from '@tauri-apps/api'
import { logger } from './logger'

const dbLogger = logger.label('DATABASE')

const tauriStorage: StateStorage = {
  getItem: async (key) => {
    try {
      const data = await invoke<string>('db_read_value', {
        directory: await appDataDir(),
        key
      })
      if (!data) return null

      try {
        JSON.parse(data)
        return data
      } catch {
        dbLogger.fatal(`Failed to parse data for key ${key}:`, data)
        return null
      }
    } catch (error) {
      dbLogger.fatal(`Failed to read file for key ${key}:`, error)
      return null
    }
  },
  setItem: async (key, value) => {
    try {
      await invoke('db_write_value', {
        directory: await appDataDir(),
        key,
        value
      })
    } catch (error) {
      dbLogger.fatal(`Failed to write file for key ${key}:`, error)
    }
  },
  removeItem: async (key) => {
    try {
      await invoke('db_remove_value', { directory: await appDataDir(), key })
      dbLogger.debug(`Removed file for key ${key}`)
    } catch (error) {
      dbLogger.fatal(`Failed to remove file for key ${key}:`, error)
    }
  }
}

export default tauriStorage
