export interface GameData {
  id: string
  vndbId?: string
  bgmId?: string
  updateDate?: number
  title: string
  alias: string[]
  cover: string
  description: string
  tags: string[]
  // playMinutes: number
  playTimelines: [number, number, number][]
  expectedPlayHours: number
  lastPlay: number
  createDate: number
  releaseDate: number
  rating: number
  developer: string
  images: string[]
  links: {
    url: string
    name: string
  }[]
}

export interface LocalData {
  id: string
  programFile: string
  savePath?: string
  guideFile?: string
}

export interface GameWithLocalData extends GameData {
  local?: LocalData
}

export interface Group {
  id: string
  name: string
  categoryIds: string[]
}

export interface Category {
  id: string
  name: string
  gameIds: string[]
}

export type FetchGameData = Omit<GameData, 'id' | 'local' | 'playTimelines' | 'lastPlay' | 'createDate' | 'updateDate'>

export type SortKeys = 'Title' | 'CreateDate' | 'LastPlay' | 'Developer' | 'Rating' | 'ReleaseDate'

export type FetchMethods = 'mixed' | 'vndb' | 'bgm'

export type Timeline = [number, number, number]

// biome-ignore lint:
export const enum DefaultGroup {
  DEVELOPER = 'developer',
  RATING = 'rating',
  PLAY_STATE = 'play_state'
}
