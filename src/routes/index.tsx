import Library from '@/pages/Library'
import Settings from '@/pages/Settings'
import Detail from '@/pages/Detail'
import Home from '@/pages/Home'
import Category from '@/pages/Category'
import Edit from '@/pages/Edit'
import { t } from '@/utils/i18n'

export type RouteConfig = {
  path: string
  component: JSX.Element
  title: string
} & (
  | {
      icon: string
    }
  | {
      belong: string
    }
)

const routes: RouteConfig[] = [
  {
    path: '/',
    component: <Home />,
    title: t`page.home.title`,
    icon: 'CompassNW'
  },
  {
    path: '/library',
    component: <Library />,
    title: t`page.library.title`,
    icon: 'WebAppBuilderFragment'
  },
  {
    path: '/details/:id',
    component: <Detail />,
    title: t`page.library.title`,
    belong: '/library'
  },
  {
    path: '/edit/:id',
    component: <Edit />,
    title: t`page.library.title`,
    belong: '/library'
  },
  {
    path: '/category/:id?',
    component: <Category />,
    title: t`page.category.title`,
    icon: 'Flag'
  },
  {
    path: '/settings',
    component: <Settings />,
    title: t`page.settings.title`,
    icon: 'Settings'
  }
]

export default routes
