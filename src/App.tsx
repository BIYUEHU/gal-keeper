import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { FluentProvider, webLightTheme } from '@fluentui/react-components'
import routes from './routes'
import Layout from './components/Layout'
import { UIProvider } from './contexts/UIContext'
import { useEffect } from 'react'
import events from './utils/events'

const App: React.FC = () => {
  useEffect(() => {
    events.on('storageInitialized', () => {
      setTimeout(() => {
        ;(window as { hideLoading?: () => void }).hideLoading?.()
      }, 200)
    })
  }, [])

  return (
    <FluentProvider theme={webLightTheme}>
      <BrowserRouter>
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
      </BrowserRouter>
    </FluentProvider>
  )
}

export default App
