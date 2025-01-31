// biome-ignore lint:
;(globalThis as any).process = {
  pid: '',
  stdout: {
    write: console.log.bind(console)
  },
  stderr: {
    write: console.error.bind(console)
  }
}

export const IS_TAURI = typeof window !== 'undefined' && '__TAURI__' in window && !!window.__TAURI__
export const IS_DEV = import.meta && !!import.meta.env?.DEV

export const APP_STORE_KEY = 'nanno'

export const SHARED_JSON_FILE = 'nanno-shared.json'
