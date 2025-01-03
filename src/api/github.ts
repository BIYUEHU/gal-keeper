import useStore, { type AppState, useSharedStore } from '@/store'
import { createHttp } from './http'
import type { GameData, GameWithLocalData, Timeline } from '@/types'
import { SHARED_JSON_FILE } from '@/constant'
import axios, { AxiosError } from 'axios'
import { base64Decode, base64Encode } from '@/utils'

const githubHttp = createHttp()
const getSettingsField = useStore.getState().getSettingsField

githubHttp.interceptors.request.use((config) => {
  const token = getSettingsField('githubToken')
  if (token) config.headers.Authorization = `token ${token}`
  return config
})

function getBaseUrl() {
  return `https://api.github.com/repos/${getSettingsField('githubRepo')}`
}

function getFileUrl(file: string) {
  let path = getSettingsField('githubPath')
  path = path.endsWith('/') ? path : `${path}/`
  path = path.startsWith('/') ? path.slice(1) : path
  return `${getBaseUrl()}/contents/${path}${file}`
}

export async function getRepoInfo() {
  const { data } = await githubHttp.get(getBaseUrl())
  useStore.setState(
    (state): Partial<AppState> => ({
      sync: {
        ...state.sync,
        size: data.size,
        visibility: data.visibility,
        username: data.owner.login,
        avatar: data.owner.avatar_url
      }
    })
  )
  return data
}

// biome-ignore lint:
export async function readFileFromGithub(file: string): Promise<any> {
  try {
    const str = base64Decode(
      (await axios.get(getFileUrl(file), { headers: { Authorization: `token ${getSettingsField('githubToken')}` } }))
        .data.content
    )
    try {
      return JSON.parse(str)
    } catch {
      return str
    }
  } catch (error) {
    if (error instanceof AxiosError && error.response?.data.status === '404') {
      await writeFileToGithub('Sync: Initial data', SHARED_JSON_FILE, { time: 0, data: [] }, true)
      return await readFileFromGithub(file)
    }
    throw error
  }
}

export async function writeFileToGithub(message: string, file: string, content: string | object, isCrate = false) {
  const url = getFileUrl(file)
  return (
    await githubHttp.put(url, {
      message,
      content: base64Encode(typeof content === 'string' ? content : JSON.stringify(content, null, 2)),
      sha: isCrate ? undefined : (await githubHttp.get(url)).data.sha
    })
  ).data
}

export async function syncToGithub() {
  const { localChanges, time } = useStore.getState().sync
  // if (localChanges.length === 0) return
  const data = useSharedStore.getState().getAllData(true)
  const { time: cloudTime, data: cloudData }: { time: number; data: GameData[] } =
    await readFileFromGithub(SHARED_JSON_FILE)

  const [localAddIds, localUpdateIds, localRemoveIds, localTimelinesIds] = (
    ['add', 'update', 'remove', 'timelines'] as const
  ).map((target) => localChanges.filter(({ type }) => type === target).map(({ id }) => id))

  const newData = [
    ...cloudData
      // Remove deleted data
      .filter((item) => !localRemoveIds.includes(item.id))
      .map(
        (item): GameData =>
          // Update information of data (Exclude `palyTimelines`)
          localUpdateIds.includes(item.id)
            ? { ...(data.find((local) => local.id === item.id) as GameData), palyTimelines: item.palyTimelines }
            : item
      )
      .map((item) =>
        // Add timelines to data
        localTimelinesIds.includes(item.id)
          ? {
              ...item,
              palyTimelines: [
                ...item.palyTimelines,
                ...(useSharedStore.getState().getData(item.id) as Required<GameWithLocalData>).palyTimelines
              ]
            }
          : item
      ),
    // Add new data
    ...data.filter(({ id }) => localAddIds.includes(id))
  ]

  const [localIds, cloudIds] = [data, cloudData].map((items) => items.map(({ id }) => id))
  const cloudAddTitles = cloudData
    .filter(({ id }) => !localIds.includes(id) && !localRemoveIds.includes(id))
    .map(({ title }) => title)
  const cloudRemoveTitles = data
    .filter(({ id }) => !cloudIds.includes(id) && !localAddIds.includes(id))
    .map(({ title }) => title)

  const syncTime = Date.now()
  const { addCloudChange } = useStore.getState()
  if (cloudAddTitles.length > 0) addCloudChange({ title: cloudAddTitles, type: 'add', time: syncTime })
  if (cloudRemoveTitles.length > 0) addCloudChange({ title: cloudRemoveTitles, type: 'remove', time: syncTime })

  const content = (() => {
    if (cloudTime === time && cloudTime === 0) return { time: syncTime, data: newData }

    if (cloudTime > time) {
      // Cloud and local happened changes, generate new timestamp
      if (localAddIds.length > 0 || localUpdateIds.length > 0 || localRemoveIds.length > 0) {
        return {
          time: syncTime,
          data: newData
        }
      }
      // Cloud happened changes but local didn't, use cloud timestamp
      return {
        time: cloudTime,
        data: newData
      }
    }

    // Cloud and local happened changes, generate new timestamp
    if (cloudAddTitles.length > 0 || cloudRemoveTitles.length > 0) {
      return {
        time: syncTime,
        data: newData
      }
    }

    // Local happened changes but cloud didn't, use local timestamp
    return {
      time: time,
      data: newData
    }
  })()

  await writeFileToGithub(
    `sync: ${
      [
        localTimelinesIds.length > 0
          ? `Play ${(() => {
              const rawMinutes =
                localChanges
                  .filter(({ id, type }) => localTimelinesIds.includes(id) && type === 'timelines')
                  .reduce((last, change) => {
                    return last + (change as { data: Timeline }).data[2]
                  }, 0) /
                1000 /
                60
              const hours = Math.floor(rawMinutes / 60)
              const minutes = Math.floor(rawMinutes % 60)
              return hours === 0 ? `${minutes}m` : `${hours}h${minutes}m`
            })()}`
          : null,
        ...[localAddIds, localUpdateIds, localRemoveIds].map(({ length }, index) =>
          length > 0 ? `${['Add', 'Update', 'Remove'][index]} ${length} games` : null
        )
      ]
        .filter((item) => item)
        .join(', ')
        .trim() || 'No changes'
    }`,
    SHARED_JSON_FILE,
    content
  )

  useStore.setState((state) => ({ sync: { ...state.sync, time: content.time, localChanges: [] } }))
  useSharedStore.setState(() => ({ data: content.data }))

  return {
    time: content.time,
    add: cloudAddTitles.length,
    remove: cloudRemoveTitles.length
  }
}
