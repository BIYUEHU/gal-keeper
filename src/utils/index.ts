import { FileName, IS_TAURI, StoreKey } from '@/constant'
import useStore from '@/store'
import type { Obj } from '@/types'
import tauriStorage from '@/utils/tauriStorage'
import { invoke } from '@tauri-apps/api/core'
import { appDataDir } from '@tauri-apps/api/path'
import * as shell from '@tauri-apps/plugin-shell'
import { type PersistStorage, createJSONStorage } from 'zustand/middleware'

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

export async function cacheImage(url: string): Promise<string> {
  if (url.startsWith('http')) {
    return (
      (await callByGuard(
        async () =>
          // `file:///${await invoke('download_image', { url, directory: [await appDataDir(), 'cache'].join('\\') })}`,
          await invoke('url_to_base64', { url }),
        (e) => `缓存图标失败：${String(e)}`
      )) ?? url
    )
  }
  return url
}

export function getStorage<T>() {
  return createJSONStorage(IS_TAURI ? () => tauriStorage : () => localStorage) as PersistStorage<T>
}

export async function callByGuard<T>(f: () => Promise<T>, handler: (e: unknown) => string): Promise<T | null> {
  try {
    return await f()
  } catch (e) {
    console.error(e)
    useStore.getState().openAlert(handler(e), '错误')
    return null
  }
}

export function getFileNameFromStoreKey(key: string) {
  return key === StoreKey.APP ? FileName.LOCAL : FileName.SHARED
}

async function sendGetRequest(url: string, data: Obj = {}, headers: Record<string, string> = {}, userAgent = '') {
  const newUrl = `${url}?${new URLSearchParams(data).toString()}`
  if (IS_TAURI) {
    const res = await invoke('send_http_request', {
      config: {
        method: 'GET',
        url: newUrl,
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
    const res = await fetch(newUrl, { method: 'GET', headers: headers })
    try {
      return await res.json()
    } catch {
      return await res.text()
    }
  }
}

async function sendPostRequest(url: string, data: Obj = {}, headers: Record<string, string> = {}, userAgent = '') {
  if (IS_TAURI) {
    const res = await invoke('send_http_request', {
      config: {
        method: 'POST',
        url,
        data: JSON.stringify(data),
        headers: Object.entries(headers),
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

export function sendRequest(
  method: 'GET' | 'POST',
  url: string,
  data: Obj = {},
  headers: Record<string, string> = {},
  userAgent = ''
) {
  return callByGuard(
    () => (method === 'GET' ? sendGetRequest : sendPostRequest)(url, data, headers, userAgent),
    (e) => `网络请求失败：${String(e)}`
  )
}

export function generateUuid() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0
    return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16)
  })
}
