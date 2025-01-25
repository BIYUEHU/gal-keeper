import { writeFileSync } from 'node:fs'
import axios from 'axios'
import { VNDB_HEADER, VNDB_URL, generateVNDBBody, searchVNDB } from './common.js'
import { join } from 'node:path'

const list = [
  "The witch's love diary",
  'はつゆきさくら',
  'アインシュタインより愛を込めて',
  'サクラノ刻',
  'アマツツミ',
  'キラ☆キラ',
  '妹調教日記 〜こんなツンデレが俺の妹なわけない!〜',
  'サクラノ詩－櫻の森の上を舞う－',
  '恋×シンアイ彼女',
  'Narcissu',
  'さくら、もゆ。',
  '紙の上の魔法使い',
  '素晴らしき日々～不連続存在～',
  '枯れない世界と終わる花',
  'ニュートンと林檎の樹',
  '星空鉄道とシロの旅'
]

async function main() {
  const result = await Promise.all(
    list.reverse().map(async (keyword, index) => {
      const data = (await axios.post(VNDB_URL, generateVNDBBody(keyword), VNDB_HEADER)).data.results[0]

      if (!data) {
        console.log(`No results found for ${keyword}`)
        return null
      }

      return {
        id: 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
          const r = (Math.random() * 16) | 0
          return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16)
        }),
        vndbId: data.id,
        bgmId: data.id,
        title: data.title,
        alias: data.titles.map((title) => title.title),
        cover: data.image?.url,
        description: data.description ?? '',
        tags: data.tags
          .filter((tag) => tag.rating >= 2)
          .sort((a, b) => b.rating - a.rating)
          .map((tag) => tag.name),
        // playMinutes: Math.floor(Math.random() * 100) + 100,
        playTimelines: [],
        expectedPlayHours: Number((data.length_minutes / 60).toFixed(1)),
        lastPlay: Date.now() - Math.random(),
        createDate: Date.now() - Math.random(),
        releaseDate: new Date(data.released).getTime(),
        rating: data.rating / 10,
        developer: data.developers[0]?.name ?? '',
        images: data.screenshots.map((screenshot) => screenshot.url),
        links: data.extlinks
      }
    })
  )
  const filtered = result.filter((game) => game)
  console.log(`Found ${filtered.length} games, not found: ${list.length - filtered.length}`)
  writeFileSync(join(process.cwd(), 'src/data/games.json'), JSON.stringify(result, null, 2))
}

main()
