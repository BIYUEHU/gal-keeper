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

export type FetchGameData = Omit<GameData, 'id' | 'local' | 'playTimelines' | 'lastPlay' | 'createDate'>

export type SortKeys = 'Title' | 'CreateDate' | 'LastPlay' | 'Developer' | 'Rating' | 'ReleaseDate'

export type FetchMethods = 'mixed' | 'vndb' | 'bgm'

export type Timeline = [number, number, number]
