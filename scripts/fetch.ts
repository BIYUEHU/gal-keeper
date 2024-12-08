import { searchBangumi, searchMoegirl, searchVNDB } from './common.js'

async function main() {
  // const name = readline.question('Enter a name to search: ')
  const name = "The Witch's Love Diary"
  console.log('\nSearching VNDB...')
  const vndbResult = await searchVNDB(name)
  if (vndbResult) {
    console.log('VNDB result:', JSON.stringify(vndbResult, null, 2))
  }

  console.log('\nSearching Moegirl...')
  const moegirlResult = await searchMoegirl(name)
  if (moegirlResult) {
    console.log('Moegirl result:', moegirlResult)
  }

  console.log('\nSearching Bangumi...')
  const bangumiResult = await searchBangumi(name)
  if (bangumiResult) {
    console.log('Bangumi result:', JSON.stringify(bangumiResult, null, 2))
  }
}

// Run the main function
main().catch((error) => {
  console.error('An error occurred:', error)
})
