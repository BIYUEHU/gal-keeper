export interface GameData {
  id: number
  vndbId: string
  bgmId: string
  title: string
  alias: string[]
  cover: string
  description: string
  tags: string[]
  playMinutes: number
  expectedPlayMinutes: number
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
  id: number
  savePath: string
  programFile: string
  guideFile: string
}

export interface GameWithLocalData extends GameData {
  local?: LocalData
}
