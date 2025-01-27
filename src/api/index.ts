import type { FetchGameData, FetchMethods } from '@/types'
import { fetchFromVndb } from './vndb'

export async function fetchGameData(method: FetchMethods, name: string): Promise<FetchGameData | null> {
  switch (method) {
    case 'vndb':
      return await fetchFromVndb(name)
  }
  return null
}
