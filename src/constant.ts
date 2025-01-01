export const IS_TAURI = typeof window !== 'undefined' && '__TAURI_INTERNALS__' in window && !!window.__TAURI_INTERNALS__

export enum FileName {
  LOCAL = 'local.dat',
  SHARED = 'shared.dat'
}

export enum StoreKey {
  APP = 'gal-keeper',
  SHARED = 'gal-keeper-shared'
}
