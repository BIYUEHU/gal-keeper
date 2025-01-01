import axios from 'axios'
import type { GameData } from '@/types'
import { useSharedState } from '@/store'

const VNDB_URL = 'https://api.vndb.org/kana/vn'

const VNDB_HEADER = {
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json'
  }
}

function generateVNDBBody(name: string) {
  return {
    filters: ['search', '=', name],
    fields:
      'id, title, image.url, released, titles.title, length_minutes, rating, screenshots.url, tags.name, developers.name, description, va.character.name, va.character.image.url, tags.rating, extlinks.name, extlinks.url'
  }
}

export async function fetchFromVndb(name: string): Promise<GameData | null> {
  const data = (await axios.post(VNDB_URL, generateVNDBBody(name), VNDB_HEADER)).data.results[0]

  return {
    id: useSharedState().getNewId(),
    vndbId: data.id,
    bgmId: data.id,
    title: data.title,
    alias: data.titles.map((title: { title: string }) => title.title),
    cover: data.image?.url,
    description: data.description ?? '',
    tags:( data.tags as {rating: number, name: string}[])
      .filter((tag) => tag.rating >= 2)
      .sort((a, b) => b.rating - a.rating)
      .map((tag) => tag.name),
    playMinutes: Math.floor(Math.random() * 100) + 100,
    expectedPlayMinutes: data.length_minutes ?? 0,
    lastPlay: Date.now() - Math.random(),
    createDate: Date.now() - Math.random(),
    releaseDate: new Date(data.released).getTime(),
    rating: data.rating / 10,
    developer: data.developers[0]?.name ?? '',
    images: data.screenshots.map((screenshot: { url: string }) => screenshot.url),
    links: data.extlinks
  }
}
