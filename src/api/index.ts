import type { FetchGameData, FetchMethods } from '@/types'
import { fetchFromVndb } from './vndb'
import { fetchFromMixed } from './mixed'
import { fetchFromBangumi } from './bgm'

export async function fetchGameData(
  method: FetchMethods,
  name: string,
  [bgmId, vndbId]: [string?, string?] = []
): Promise<FetchGameData | null> {
  switch (method) {
    case 'vndb':
      return await fetchFromVndb(name, vndbId)
    case 'bgm':
      return await fetchFromBangumi(name, bgmId)
    case 'mixed':
      return await fetchFromMixed(name, [bgmId, vndbId])
  }
  return null
}
