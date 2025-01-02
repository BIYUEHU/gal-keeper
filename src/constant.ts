export const IS_TAURI = typeof window !== 'undefined' && '__TAURI_INTERNALS__' in window && !!window.__TAURI_INTERNALS__

export enum FileName {
  LOCAL = 'local.db',
  SHARED = 'shared.db'
}

export enum StoreKey {
  APP = 'gal-keeper',
  SHARED = 'gal-keeper-shared'
}
