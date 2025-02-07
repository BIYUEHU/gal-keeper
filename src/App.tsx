import { BrowserRouter, HashRouter, Route, Routes } from 'react-router-dom'
import { FluentProvider, webLightTheme } from '@fluentui/react-components'
import routes from '@/routes'
import Layout from '@/components/Layout'
import { UIProvider } from '@/contexts/UIContext'
import { useEffect, useRef, useState } from 'react'
import useStore from '@/store'
import i18n, { f, t } from '@/utils/i18n'
import { cacheImage, openUrl } from '@/utils'
import logger, { invokeLogger } from '@/utils/logger'
import { IS_DEV, IS_TAURI } from '@/constant'
import { version } from '@/../package.json'
import axios from 'axios'
import { listen } from '@tauri-apps/api/event'
import { syncToGithub } from '@/api/github'
import { invoke } from '@tauri-apps/api'
import { random } from '@kotori-bot/tools'

const App: React.FC = () => {
  const syncId = useRef(random.int(0, 1000000).toString())
  const lastSyncNoticeTime = useRef(0)
  const state = useStore((state) => state)
  const [initialized, setInitialized] = useState(false)
  const [latestVersion, setLatestVersion] = useState('')

  useEffect(() => {
    if (!state._hasHydrated || initialized) return

    Promise.race(
      [
        'https://cdn.jsdelivr.net/gh/biyuehu/gal-keeper/package.json',
        'https://raw.githubusercontent.com/BIYUEHU/gal-keeper/refs/heads/main/package.json'
      ].map((url) => axios.get(url).catch(() => null))
    )
      .then((res) => {
        if (!res) return setLatestVersion('error')
        if (res.data.version !== version) setLatestVersion(res.data.version)
      })
      .finally(() => {
        i18n.set(state.settings.language)
        state.gameData.map((game) => cacheImage(game).catch((e) => invokeLogger.error(e)))

        if (initialized) return
        if (state.settings.playLaunchVoice && !latestVersion) new Audio('/assets/launch.wav').play()
        ;(window as { hideLoading?: () => void }).hideLoading?.()
        setInitialized(true)

        // useStore.setState({
        //   ...DEFAULT_STATE,
        //   ...state,
        //   settings: {
        //     ...DEFAULT_STATE.settings,
        //     ...state.settings
        //   },
        //   sync: {
        //     ...DEFAULT_STATE.sync,
        //     ...state.sync
        //   }
        // })

        if (!IS_TAURI || !state.settings.autoSyncMinutes || state.settings.autoSyncMinutes <= 0) return
        invoke('auto_sync', {
          durationMinutes: state.settings.autoSyncMinutes,
          id: syncId.current
        }).catch((e) => invokeLogger.error(e))
        listen<string>('sync', ({ payload }) => {
          if (syncId.current !== payload) return
          if (Date.now() - lastSyncNoticeTime.current < 1000 * 10) return
          if (lastSyncNoticeTime.current === 0 && IS_DEV) return
          lastSyncNoticeTime.current = Date.now()
          const { githubToken, githubRepo, githubPath } = useStore.getState().settings
          if (!githubToken || !githubRepo || !githubPath) {
            logger.warn('auto-sync skipped due to missing settings.')
            return
          }
          logger.debug('starting auto-sync...')
          syncToGithub().then(() => {
            logger.debug('auto-sync finished.')
          })
        })
      })
  }, [state, initialized, latestVersion])

  if (!initialized) return null

  if (!IS_DEV && latestVersion) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <h1 className="text-3xl font-bold mb-4">
          {latestVersion === 'error' ? t`app.update.title.failed` : t`app.update.title`}
        </h1>
        <span className="text-lg">
          {latestVersion === 'error' ? t`app.update.message.failed` : f`app.update.message`(version, latestVersion)}
        </span>
        {latestVersion !== 'error' && (
          <button
            type="button"
            className="mt-2 bg-red-300 hover:bg-red-400 text-white font-bold py-2 px-4 rounded border-red"
            onClick={() => openUrl('https://github.com/BIYUEHU/gal-keeper/releases/')}
          >
            {t`app.update.button`}
          </button>
        )}
      </div>
    )
  }

  return (
    <FluentProvider theme={webLightTheme}>
      {((children) => (IS_TAURI ? <BrowserRouter>{children}</BrowserRouter> : <HashRouter>{children}</HashRouter>))(
        <UIProvider>
          <Routes>
            {routes.map((route) => (
              <Route
                key={route.path}
                path={route.path}
                element={<Layout title={route.title} outlet={route.component} />}
              />
            ))}
          </Routes>
        </UIProvider>
      )}
    </FluentProvider>
  )
}

export default App
