import { BrowserRouter, HashRouter, Route, Routes } from 'react-router-dom'
import { FluentProvider, webLightTheme } from '@fluentui/react-components'
import routes from '@/routes'
import Layout from '@/components/Layout'
import { UIProvider } from './contexts/UIContext'
import { useEffect, useState } from 'react'
import useStore from '@/store'
import i18n, { f, t } from '@/utils/i18n'
import { cacheImage, openUrl } from '@/utils'
import logger, { invokeLogger } from '@/utils/logger'
import { IS_DEV, IS_TAURI } from '@/constant'
import { version } from '@/../package.json'
import axios from 'axios'
import { listen } from '@tauri-apps/api/event'
import { syncToGithub } from './api/github'
import { invoke } from '@tauri-apps/api'

const App: React.FC = () => {
  const { _hasHydrated, settings, gameData } = useStore((state) => state)
  const [initialized, setInitialized] = useState(false)
  const [latestVersion, setLatestVersion] = useState('')

  useEffect(() => {
    if (!_hasHydrated) return

    axios
      .get('https://raw.githubusercontent.com/BIYUEHU/gal-keeper/refs/heads/main/package.json')
      .then((res) => {
        if (res.data.version !== version) setLatestVersion(res.data.version)
      })
      .catch(() => setLatestVersion('error'))
      .finally(() => {
        i18n.set(settings.language)
        gameData.map((game) => cacheImage(game).catch((e) => invokeLogger.error(e)))

        if (initialized) return
        if (settings.playLaunchVoice && !latestVersion) new Audio('/assets/launch.wav').play()
        ;(window as { hideLoading?: () => void }).hideLoading?.()
        setInitialized(true)

        if (!IS_TAURI) return

        invoke('auto_sync', {
          durationMinutes: settings.autoSyncMinutes
        }).catch((e) => invokeLogger.error(e))
        listen('sync', () => {
          logger.debug('starting auto-sync...')
          syncToGithub().then(() => {
            logger.debug('auto-sync finished.')
          })
        })
      })
  }, [_hasHydrated, settings, gameData, initialized, latestVersion])

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
