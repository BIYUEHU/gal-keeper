import { IS_TAURI } from '@/constant'
import useStore from '@/store'
import tauriStorage from '@/utils/tauriStorage'
import { invoke } from '@tauri-apps/api/core'
import * as shell from '@tauri-apps/plugin-shell'
import { type PersistStorage, createJSONStorage } from 'zustand/middleware'
import { logger } from './logger'

export function getStorage<T>() {
  return createJSONStorage(IS_TAURI ? () => tauriStorage : () => localStorage) as PersistStorage<T>
}

export function generateUuid() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0
    return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16)
  })
}

export async function openUrl(url: string) {
  if (IS_TAURI) {
    await shell.open(url)
  } else {
    window.open(url, '_blank')
  }
}

export async function invokeSafe<T>(
  cmd: string,
  args: Parameters<typeof invoke>[1] = {},
  handler: (e: unknown) => string = (e) => `意外的错误：${String(e)}`
): Promise<T | null> {
  try {
    return await invoke(cmd, args)
  } catch (e) {
    logger.label('INVOKE').error(`\n Command: ${cmd}\n Args:`, args, '\n Error:', e)
    useStore.getState().openAlert(handler(e), '错误')
    return null
  }
}

export async function cacheImage(url: string): Promise<string> {
  return url.startsWith('http')
    ? ((await invokeSafe<string>('url_to_base64', { url }, (e) => `缓存图标失败：${String(e)}`)) ?? url)
    : url
}

export function base64Decode(base64: string) {
  // biome-ignore lint:
  return new TextDecoder().decode((Uint8Array.from as any)(atob(base64), (m: any) => m.codePointAt(0)))
}

export function base64Encode(str: string) {
  return btoa(Array.from(new TextEncoder().encode(str), (byte) => String.fromCodePoint(byte)).join(''))
}
