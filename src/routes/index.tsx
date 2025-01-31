import Library from '@/pages/Library'
import Settings from '@/pages/Settings'
import Detail from '@/pages/Detail'
import Home from '@/pages/Home'
import Category from '@/pages/Category'
import Edit from '@/pages/Edit'
import About from '@/pages/About'

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
    title: 'page.home.title',
    icon: 'CompassNW'
  },
  {
    path: '/library',
    component: <Library />,
    title: 'page.library.title',
    icon: 'WebAppBuilderFragment'
  },
  {
    path: '/details/:id',
    component: <Detail />,
    title: 'page.library.title',
    belong: '/library'
  },
  {
    path: '/edit/:id',
    component: <Edit />,
    title: 'page.library.title',
    belong: '/library'
  },
  {
    path: '/category/:id?',
    component: <Category />,
    title: 'page.category.title',
    icon: 'Flag'
  },
  {
    path: '/settings',
    component: <Settings />,
    title: 'page.settings.title',
    icon: 'Settings'
  },
  {
    path: '/about',
    component: <About />,
    title: 'page.about.title',
    icon: 'Info'
  }
]

export default routes
