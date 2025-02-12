import type { FetchGameData } from '@/types'
import { createHttp } from './http'
import useStore from '@/store'

interface VndbAuthInfo {
  id: string
  username: string
  permissions: string[]
}

const vndbHttp = createHttp()

vndbHttp.interceptors.request.use((config) => {
  const { vndbToken } = useStore.getState().settings
  if (vndbToken) config.headers.Authorization = `token ${vndbToken}`
  config.headers.Accept = 'application/json'
  config.headers['Content-Type'] = 'application/json'
  config.baseURL = 'https://api.vndb.org/kana'
  return config
})

function generateVndbBody(name: string, isId: boolean) {
  return {
    filters: isId ? ['id', '=', name] : ['search', '=', name],
    fields:
      'id, title, image.url, released, titles.title, length_minutes, rating, screenshots.url, tags.name, developers.name, description, va.character.name, va.character.image.url, tags.rating, extlinks.name, extlinks.url'
  }
}

export async function getVndbAuthInfo(): Promise<VndbAuthInfo> {
  return (await vndbHttp.get('/authinfo')).data
}

export async function fetchFromVndb(name: string, id?: string): Promise<FetchGameData | null> {
  const data = (await vndbHttp.post('/vn', generateVndbBody(id || name, !!id))).data.results[0]
  if (!data) return null

  return {
    bgmId: undefined,
    vndbId: String(data.id),
    title: data.title,
    alias: data.titles.map((title: { title: string }) => title.title),
    cover: data.image?.url ?? '',
    description: data.description ?? '',
    tags: (data.tags as { rating: number; name: string }[])
      .filter((tag) => tag.rating >= 2)
      .sort((a, b) => b.rating - a.rating)
      .slice(0, 30)
      .map(({ name }) => name),
    expectedPlayHours: Number((data.length_minutes / 60).toFixed(1)),
    releaseDate: new Date(data.released).getTime(),
    rating: Number((data.rating / 10).toFixed(1)),
    developer: data.developers[0]?.name ?? '',
    images: data.screenshots.map((screenshot: { url: string }) => screenshot.url),
    links: data.extlinks
  }
}
