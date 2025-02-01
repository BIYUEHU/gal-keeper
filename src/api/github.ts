import useStore from '@/store/'
import type { RootState } from '@/store'
import http, { createHttp } from './http'
import { cloudDataSchema, type GameData } from '@/types'
import { SHARED_JSON_FILE } from '@/constant'
import axios, { AxiosError } from 'axios'
import { base64Decode, base64Encode, showMinutes } from '@/utils'

const githubHttp = createHttp()

githubHttp.interceptors.request.use((config) => {
  const { githubToken } = useStore.getState().settings
  if (githubToken) config.headers.Authorization = `token ${githubToken}`
  return config
})

function getBaseUrl() {
  return `https://api.github.com/repos/${useStore.getState().settings.githubRepo}`
}

function getFileUrl(file: string) {
  let { githubPath } = useStore.getState().settings
  githubPath = githubPath.endsWith('/') ? githubPath : `${githubPath}/`
  githubPath = githubPath.startsWith('/') ? githubPath.slice(1) : githubPath
  return `${getBaseUrl()}/contents/${githubPath}${file}`
}

export async function getRepoInfo() {
  const { data } = await githubHttp.get(getBaseUrl())
  useStore.setState(
    (state): Partial<RootState> => ({
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
    const res = (
      await axios.get(getFileUrl(file), {
        headers: { Authorization: `token ${useStore.getState().settings.githubToken}` }
      })
    ).data
    const str = res.content
      ? base64Decode(res.content)
      : JSON.stringify((await http.get(res.download_url.split('?token=')[0])).data)
    try {
      return JSON.parse(str)
    } catch {
      return str
    }
  } catch (error) {
    if (error instanceof AxiosError && error.response?.data.status === '404') {
      await writeFileToGithub('Sync: Initial data', SHARED_JSON_FILE, { deleteIds: [], data: [] }, true)
      return await readFileFromGithub(file)
    }
    throw error
  }
}

export async function writeFileToGithub(message: string, file: string, content: string | object, isCrate = false) {
  const url = getFileUrl(file)
  return await githubHttp.put(url, {
    message,
    content: base64Encode(typeof content === 'string' ? content : JSON.stringify(content, null, 2)),
    sha: isCrate ? undefined : (await githubHttp.get(url)).data.sha
  })
}

export async function syncToGithub() {
  const {
    sync: { deleteIds },
    gameData: data
  } = useStore.getState()
  const { deleteIds: cloudDeltedIds, data: cloudData } = cloudDataSchema.parse(
    await readFileFromGithub(SHARED_JSON_FILE)
  )

  const newDeleteIds = Array.from(new Set([...deleteIds, ...cloudDeltedIds]))

  const [dataIds, cloudDataIds] = [data, cloudData].map((arr) =>
    arr.map(({ id }) => id).filter((id) => !newDeleteIds.includes(id))
  )

  const newData = [
    ...cloudData
      .filter((item) => !deleteIds.includes(item.id))
      .map(
        (item): GameData =>
          dataIds.includes(item.id)
            ? ((target): GameData => ({
                ...(target.updateDate > item.updateDate ? target : item),
                playTimelines: [
                  ...target.playTimelines,
                  ...item.playTimelines.filter((timeline) => !target.playTimelines.some((t) => t[0] === timeline[0]))
                ].sort((a, b) => a[0] - b[0])
              }))(data.find((local) => local.id === item.id) as GameData)
            : item
      ),
    ...data.filter(({ id }) => !cloudDataIds.includes(id) && !cloudDeltedIds.includes(id))
  ]

  const [totalTime, cloudTotalTime] = [data, cloudData].map((arr) =>
    arr.reduce((last, { playTimelines }) => last + playTimelines.reduce((sum, [, , time]) => sum + time, 0), 0)
  )

  await writeFileToGithub(
    `sync: ${
      [
        totalTime > cloudTotalTime ? `Playtime +${showMinutes((totalTime - cloudTotalTime) / 1000)}` : null,
        newData.length > cloudData.length ? `Add ${newData.length - cloudData.length} games` : null,
        cloudDataIds.length < cloudData.length ? `Remove ${cloudData.length - cloudDataIds.length} games` : null,
        ((count) => (count > 0 ? `Update ${count} games` : null))(
          cloudData
            .filter((item) => !deleteIds.includes(item.id))
            .reduce(
              (acc, cur) =>
                acc +
                (dataIds.includes(cur.id) &&
                (data.find((local) => local.id === cur.id) as GameData).updateDate !== cur.updateDate
                  ? 1
                  : 0),
              0
            )
        )
      ]
        .filter((item) => item)
        .join(', ')
        .trim() || 'No changes'
    }`,
    SHARED_JSON_FILE,
    { deleteIds: newDeleteIds, data: newData }
  ).then(() => {
    useStore.setState((state) => ({
      sync: {
        ...state.sync,
        time: Date.now(),
        deleteIds: newDeleteIds
      },
      gameData: newData
    }))
  })
}
