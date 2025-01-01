import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { FluentProvider, webLightTheme } from '@fluentui/react-components'
import routes from './routes'
import { Layout } from './components/Layout'

const App: React.FC = () => (
  <FluentProvider theme={webLightTheme}>
    <BrowserRouter>
      <Routes>
        {routes.map((route) => (
          <Route key={route.path} path={route.path} element={<Layout title={route.title} outlet={route.component} />} />
        ))}
      </Routes>
    </BrowserRouter>
  </FluentProvider>
)

export default App
