import { FileName, IS_TAURI, StoreKey } from '@/constant'
import tauriStorage from '@/store/tauriStorage'
import { invoke } from '@tauri-apps/api/core'
import { appDataDir } from '@tauri-apps/api/path'
import * as shell from '@tauri-apps/plugin-shell'
import { type PersistStorage, createJSONStorage } from 'zustand/middleware'

export * from './api/vndb'

export async function openUrl(url: string) {
  if (IS_TAURI) {
    await shell.open(url)
  } else {
    window.open(url, '_blank')
  }
}

export async function initializeDirectory() {
  await invoke('initialize_directory', {
    directory: await appDataDir(),
    files: [FileName.LOCAL, FileName.SHARED]
  })
}

export function getStorage<T>() {
  return createJSONStorage(IS_TAURI ? () => tauriStorage : () => localStorage) as PersistStorage<T>
}

export function getFileNameFromStoreKey(key: string) {
  return key === StoreKey.APP ? FileName.LOCAL : FileName.SHARED
}

export async function sendGetRequest(url: string, headers?: Record<string, string>, userAgent?: string) {
  if (IS_TAURI) {
    const res = await invoke('send_http_request', {
      config: {
        method: 'GET',
        url,
        headers: Object.entries(headers || {}),
        user_agent: userAgent
      }
    })
    // biome-ignore lint:
    const body = (res as { body: any }).body
    try {
      return JSON.parse(body)
    } catch {
      return body
    }
  } else {
    const res = await fetch(url, { method: 'GET', headers: headers })
    try {
      return await res.json()
    } catch {
      return await res.text()
    }
  }
}

export async function sendPostRequest(url: string, data: object, headers?: Record<string, string>, userAgent?: string) {
  if (IS_TAURI) {
    const res = await invoke('send_http_request', {
      config: {
        method: 'POST',
        url,
        data: JSON.stringify(data),
        headers: Object.entries(headers || {}),
        user_agent: userAgent
      }
    })
    // biome-ignore lint:
    const body = (res as { body: any }).body
    try {
      return JSON.parse(body)
    } catch {
      return body
    }
  } else {
    const res = await fetch(url, { method: 'POST', body: JSON.stringify(data), headers: headers })
    try {
      return await res.json()
    } catch {
      return await res.text()
    }
  }
}

export async function urlToBase64(url: string): Promise<string> {
  return await invoke('url_to_base64', { url })
}

