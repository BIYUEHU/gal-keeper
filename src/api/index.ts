import type { FetchGameData, FetchMethods } from '@/types'
import { fetchFromVndb } from './vndb'
import useStore from '@/store'
import { IS_TAURI } from '@/constant'
import { cacheImage } from '@/utils'

export async function fetchGameData(method: FetchMethods, name: string): Promise<FetchGameData | null> {
  let data: FetchGameData | null = null

  switch (method) {
    case 'vndb':
      data = await fetchFromVndb(name)
      break
  }

  if (!data) {
    useStore.getState().openAlert('自动获取数据失败，未找到相关游戏')
    return null
  }

  const { settings } = useStore.getState()

  return {
    ...data,
    ...{ title: settings.autoSetGameTitle ? data.title : name },
    ...{ cover: data.cover && IS_TAURI && settings.autoCacheGameCover ? await cacheImage(data.cover) : data.cover }
  }
}
