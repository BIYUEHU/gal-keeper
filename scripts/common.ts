import axios from 'axios'
import * as readline from 'readline-sync'

// biome-ignore lint:
export type obj = { [key: string]: any }

export const VNDB_URL = 'https://api.vndb.org/kana/vn'

export const VNDB_HEADER = {
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json'
  }
}

export function generateVNDBBody(name: string) {
  return {
    filters: ['search', '=', name],
    fields:
      'id, title, image.url, released, titles.title, length_minutes, rating, screenshots.url, tags.name, developers.name, description, va.character.name, va.character.image.url, tags.rating, extlinks.name, extlinks.url'
  }
}

export async function searchVNDB(name: string) {
  try {
    const response = await axios.post(VNDB_URL, generateVNDBBody(name), VNDB_HEADER)

    const results = response.data.results
    if (results.length === 0) {
      console.log('No results found on VNDB.')
      return null
    }

    if (results.length === 1) {
      return results[0]
    }

    console.log('Multiple results found on VNDB. Please choose:')
    results.forEach((result: obj, index: number) => {
      console.log(`${index + 1}. ${result.title} (${result.original})`)
    })

    const choice = readline.questionInt('Enter your choice: ') - 1
    return results[choice]
  } catch (error) {
    console.error('Error searching VNDB:', error)
    return null
  }
}

// 萌娘百科 API
export async function searchMoegirl(name: string) {
  try {
    const response = await axios.get('https://zh.moegirl.org.cn/api.php', {
      params: {
        action: 'opensearch',
        search: name,
        limit: 10,
        format: 'json'
      }
    })

    const results = response.data[1]
    console.log(results)
    if (results.length === 0) {
      console.log('No results found on Moegirl.')
      return null
    }

    if (results.length === 1) {
      return results[0]
    }

    console.log('Multiple results found on Moegirl. Please choose:')
    results.forEach((result: string, index: number) => {
      console.log(`${index + 1}. ${result}`)
    })

    const choice = readline.questionInt('Enter your choice: ') - 1
    return results[choice]
  } catch (error) {
    console.error('Error searching Moegirl:', error)
    return null
  }
}

// Bangumi API
export async function searchBangumi(name: string) {
  try {
    const response = await axios.get(`https://api.bgm.tv/search/subject/${encodeURIComponent(name)}`, {
      params: {
        type: 4, // 4 represents game
        responseGroup: 'simple',
        max_results: 10
      }
    })

    const results = response.data.list
    if (results.length === 0) {
      console.log('No results found on Bangumi.')
      return null
    }

    if (results.length === 1) {
      return results[0]
    }

    console.log('Multiple results found on Bangumi. Please choose:')
    results.forEach((result: obj, index: number) => {
      console.log(`${index + 1}. ${result.name} (${result.name_cn})`)
    })

    const choice = readline.questionInt('Enter your choice: ') - 1
    return results[choice]
  } catch (error) {
    console.error('Error searching Bangumi:', error)
    return null
  }
}
