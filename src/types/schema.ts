import Tsu from 'tsukiko'

export const gameDataSchema = Tsu.Object({
  id: Tsu.String(),
  vndbId: Tsu.String().optional(),
  bgmId: Tsu.String().optional(),
  updateDate: Tsu.Number(),
  title: Tsu.String(),
  alias: Tsu.Array(Tsu.String()),
  cover: Tsu.String(),
  description: Tsu.String(),
  tags: Tsu.Array(Tsu.String()),
  playTimelines: Tsu.Array(Tsu.Tuple([Tsu.Number(), Tsu.Number(), Tsu.Number()])),
  expectedPlayHours: Tsu.Number(),
  lastPlay: Tsu.Number(),
  createDate: Tsu.Number(),
  releaseDate: Tsu.Number(),
  rating: Tsu.Number(),
  developer: Tsu.String(),
  images: Tsu.Array(Tsu.String()),
  links: Tsu.Array(
    Tsu.Object({
      url: Tsu.String(),
      name: Tsu.String()
    })
  )
})

export const gameDataListSchema = Tsu.Array(gameDataSchema)

export type GameData = Tsu.infer<typeof gameDataSchema>
