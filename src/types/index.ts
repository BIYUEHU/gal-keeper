import type { GameData } from './schema'

export * from './schema'

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
