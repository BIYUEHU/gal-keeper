import { IS_TAURI } from '@/constant'
import { invoke, shell } from '@tauri-apps/api'
import type { Timeline } from '@/types'
import { f, t } from './i18n'
import { appDataDir } from '@tauri-apps/api/path'

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

export async function cacheImage(url: string): Promise<string> {
  return invoke('download_image', {
    url,
    directory: await appDataDir()
  })
}

export function base64Decode(base64: string) {
  // biome-ignore lint:
  return new TextDecoder().decode((Uint8Array.from as any)(atob(base64), (m: any) => m.codePointAt(0)))
}

export function base64Encode(str: string) {
  return btoa(Array.from(new TextEncoder().encode(str), (byte) => String.fromCodePoint(byte)).join(''))
}

export function calculateTotalPlayTime(timelines: Timeline[]) {
  return timelines.reduce((acc, cur) => acc + cur[2], 0) / 60
}

export function showMinutes(raw: number) {
  const hours = Math.floor(raw / 60)
  const minutes = Math.floor(raw % 60)
  return hours === 0 ? `${minutes}m` : `${hours}h${minutes}m`
}

export function showTime(raw: number) {
  const now = Date.now() / 1000
  /*   'time.justnow': '刚刚',
  'time.minutesAgo': '{0} 分钟前',
  'time.hoursAgo': '{0} 小时前',
  'time.yesterday': '昨天',
  'time.daysAgo': '{0} 天前',
  'time.lastWeek': '上周',
  'time.weeksAgo': '{0} 周前',
  'time.lastMonth': '上个月',
  'time.monthsAgo': '{0} 个月前',
  'time.lastYear': '去年',
  'time.yearsAgo': '{0} 年前' */
  if (now - raw < 60) return t`time.justnow`
  if (now - raw < 60 * 60) return f`time.minutesAgo`(Math.floor((now - raw) / 60).toString())
  if (now - raw < 60 * 60 * 24) return f`time.hoursAgo`(Math.floor((now - raw) / (60 * 60)).toString())
  if (now - raw < 60 * 60 * 24 * 2) return t`time.yesterday`
  if (now - raw < 60 * 60 * 24 * 7) return f`time.daysAgo`(Math.floor((now - raw) / (60 * 60 * 24)).toString())
  if (now - raw < 60 * 60 * 24 * 7 * 2) return t`time.lastWeek`
  if (now - raw < 60 * 60 * 24 * 7 * 4) return f`time.weeksAgo`(Math.floor((now - raw) / (60 * 60 * 24 * 7)).toString())
  if (now - raw < 60 * 60 * 24 * 30 * 2) return t`time.lastMonth`
  if (now - raw < 60 * 60 * 24 * 30 * 12)
    return f`time.monthsAgo`(Math.floor((now - raw) / (60 * 60 * 24 * 30)).toString())
  if (now - raw < 60 * 60 * 24 * 365 * 2) return t`time.lastYear`
  return f`time.yearsAgo`(Math.floor((now - raw) / (60 * 60 * 24 * 365)).toString())
}
