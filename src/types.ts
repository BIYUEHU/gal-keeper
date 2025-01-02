export interface GameData {
  id: string
  vndbId?: string
  bgmId?: string
  title: string
  alias: string[]
  cover: string
  description: string
  tags: string[]
  // playMinutes: number
  palyTimelines: [number, number, number][]
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

export type FetchGameData = Omit<GameData, 'id' | 'local' | 'palyTimelines' | 'lastPlay' | 'createDate'>

export type SortKeys = 'Title' | 'CreateDate' | 'LastPlay' | 'Developer' | 'Rating' | 'ReleaseDate'

export type FetchMethods = 'mixed' | 'vndb' | 'bgm'

export type Timeline = [number, number, number]

// biome-ignore lint:
export type Obj = { [key: string]: any }
