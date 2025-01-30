import type { FetchGameData } from '@/types'
import http from './http'
import { version } from '@/../package.json'
import { invoke } from '@tauri-apps/api'
import { httpLogger, invokeLogger } from '@/utils/logger'

export async function fetchFromBangumi(name: string, id?: string): Promise<FetchGameData | null> {
  let tempId = id
  if (!id) {
    const res = (await invoke('send_http_request', {
      config: {
        method: 'POST',
        url: `https://api.bgm.tv/search/subject/${encodeURIComponent(name)}`,
        userAgent: `biyuehu/gal-keeper/${version} (https://github.com/biyuehu/gal-keeper)`
      }
    }).catch((e) => {
      invokeLogger.error(e)
      throw e
      // biome-ignore lint:
    })) as any
    if (res.status !== 200) {
      httpLogger.error(res.body)
      throw new Error(`Bangumi API error, status code: ${res.status}, body: ${res.body}`)
    }

    const list = (() => {
      try {
        return JSON.parse(res.body)
      } catch (e) {
        httpLogger.error(e)
        throw e
      }
    })().list.filter(({ type }: { type: number }) => type === 4)
    if (!list || list.length === 0) return null
    tempId = list[0].id
  }
  const { data } = await http.get(`https://api.bgm.tv/v0/subjects/${tempId}`)

  return {
    vndbId: undefined,
    bgmId: String(tempId),
    title: data.name,
    alias: data.name_cn ? [data.name_cn] : [],
    cover: data.images?.large ?? '',
    description: data.summary ?? '',
    tags: data.tags
      .sort((a: { count: number }, b: { count: number }) => a.count - b.count)
      .slice(0, 30)
      .map(({ name }: { name: string }) => name),
    expectedPlayHours: 0,
    releaseDate: new Date(data.date).getTime(),
    rating: data.rating?.score ?? 0,
    developer: data.infobox.find((info: { key: string }) => info.key === '开发')?.value ?? '',
    images: data.images ? [data.images.large] : [],
    links: []
  }
}
