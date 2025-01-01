import { Library } from '@/pages/Library'
import { Settings } from '@/pages/Settings'
import { Detail } from '@/pages/Detail'
import { Home } from '@/pages/Home'
import { Category } from '@/pages/Category'
import { Edit } from '@/pages/Edit'

export interface RouteConfig {
  path: string
  component: JSX.Element
  title: string
  icon?: string
}

const routes: RouteConfig[] = [
  {
    path: '/',
    component: <Home />,
    title: '首页',
    icon: 'CompassNW'
  },
  {
    path: '/library',
    component: <Library />,
    title: '游戏',
    icon: 'WebAppBuilderFragment'
  },
  {
    path: '/details/:id',
    component: <Detail />,
    title: '游戏'
  },
  {
    path: '/edit/:id',
    component: <Edit />,
    title: '游戏'
  },
  {
    path: '/category',
    component: <Category />,
    title: '分类',
    icon: 'Flag'
  },
  {
    path: '/settings',
    component: <Settings />,
    title: '设置',
    icon: 'Settings'
  }
]

export default routes
