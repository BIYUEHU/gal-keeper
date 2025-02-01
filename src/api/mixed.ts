import type { FetchGameData } from '@/types'
import { fetchFromBgm } from './bgm'
import { fetchFromVndb } from './vndb'

export async function fetchFromMixed(
  name: string,
  [bgmId, vndbId]: [string?, string?] = []
): Promise<FetchGameData | null> {
  const [bgmData, vndbData] = await Promise.all([
    fetchFromBgm(name, bgmId).catch(() => null),
    fetchFromVndb(name, vndbId)
  ])
  if (!bgmData && !vndbData) return null
  return {
    bgmId: bgmData?.bgmId,
    vndbId: vndbData?.vndbId,
    title: (bgmData?.title || vndbData?.title) ?? '',
    alias: Array.from(new Set([bgmData?.alias, vndbData?.alias].flat().filter((item) => item))) as string[],
    cover: (bgmData?.cover || vndbData?.cover) ?? '',
    description: (bgmData?.description || vndbData?.description) ?? '',
    tags: (bgmData?.tags || vndbData?.tags) ?? [],
    expectedPlayHours: vndbData?.expectedPlayHours ?? 0,
    releaseDate: bgmData?.releaseDate ?? vndbData?.releaseDate ?? 0,
    rating: bgmData?.rating ?? vndbData?.rating ?? 0,
    developer: vndbData?.developer ?? '',
    images: vndbData?.images ?? [],
    links: vndbData?.links ?? []
  }
}
