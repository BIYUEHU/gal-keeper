import { createBrowserRouter } from 'react-router-dom'
import { GameLibrary } from '@/pages/GameLibrary'
import { Settings } from '@/pages/Settings'
import { GameDetail } from '@/pages/GameDetail'
import { Layout } from '@/components/Layout/Layout'

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      {
        path: '/',
        element: <GameLibrary />
      },
      {
        path: '/games/:id',
        element: <GameDetail />
      },
      {
        path: '/categories',
        element: <GameLibrary />
      },
      {
        path: '/settings',
        element: <Settings />
      }
    ]
  }
])
