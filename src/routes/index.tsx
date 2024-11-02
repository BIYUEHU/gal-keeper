import { createBrowserRouter } from 'react-router-dom';
import { GameLibrary } from '../pages/GameLibrary';
import { Settings } from '../pages/Settings';
import { GameDetail } from '../pages/GameDetail';
import { Layout } from '../components/Layout/Layout';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      {
        path: '/',
        element: <GameLibrary />,
      },
      {
        path: '/game/:id',
        element: <GameDetail />,
      },
      {
        path: '/settings',
        element: <Settings />,
      },
    ],
  },
]);
