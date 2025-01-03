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

export const IS_TAURI = typeof window !== 'undefined' && '__TAURI_INTERNALS__' in window && !!window.__TAURI_INTERNALS__
export const IS_DEV = import.meta && !!import.meta.env?.DEV

export enum StoreKey {
  APP = 'gal-keeper',
  SHARED = 'gal-keeper-shared'
}

export const SHARED_JSON_FILE = `${StoreKey.SHARED}.json`
