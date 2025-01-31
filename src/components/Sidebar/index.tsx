import { useMemo } from 'react'
import { Stack } from '@fluentui/react/lib/Stack'
import { Icon } from '@fluentui/react/lib/Icon'
import routes from '@/routes'
import { useLocation, useNavigate } from 'react-router-dom'
import { useUI } from '@/contexts/UIContext'
import i18n from '@/utils/i18n'

const Sidebar: React.FC = () => {
  const {
    state: { sidebarOpen },
    toggleSidebar
  } = useUI()
  const location = useLocation()
  const currentPage = useMemo(
    () => routes.find((item) => item.path.startsWith(`/${location.pathname.split('/')[1]}`)),
    [location]
  )
  const navigate = useNavigate()

  // 提取最后两个选项
  const lastTwoRoutes = routes.slice(-2)
  const otherRoutes = routes.slice(0, -2)

  return (
    <Stack className={`h-screen bg-gray-50 ${sidebarOpen ? 'w-64' : 'w-13'}`}>
      <div className="space-y-1 flex flex-col justify-between h-full">
        <div>
          <div
            className="mt-2 w-7 h-7 flex items-center mx-1 p-2 cursor-pointer hover:bg-gray-200"
            onClick={toggleSidebar}
          >
            <Icon iconName="GlobalNavButton" className="ml-2 scale-120" />
          </div>
          {otherRoutes
            .filter((item) => 'icon' in item)
            .map((item) => (
              <div
                className={`h-6 flex items-center mx-1 p-2 cursor-pointer ${item.path === currentPage?.path || (currentPage && 'belong' in currentPage && item.path === currentPage.belong) ? 'bg-gray-200' : 'hover:bg-gray-200'}`}
                key={item.path}
                onClick={() => navigate(item.path)}
              >
                <Icon iconName={(item as { icon: string }).icon} className="ml-2 scale-120" />
                {sidebarOpen && <span className="ml-2">{i18n.locale(item.title)}</span>}
              </div>
            ))}
        </div>
        <div className="pb-1">
          {lastTwoRoutes
            .filter((item) => 'icon' in item)
            .map((item) => (
              <div
                className={`h-6 flex items-center mx-1 p-2 cursor-pointer ${item.path === currentPage?.path || (currentPage && 'belong' in currentPage && item.path === currentPage.belong) ? 'bg-gray-200' : 'hover:bg-gray-200'}`}
                key={item.path}
                onClick={() => navigate(item.path)}
              >
                <Icon iconName={(item as { icon: string }).icon} className="ml-2 scale-120" />
                {sidebarOpen && <span className="ml-2">{i18n.locale(item.title)}</span>}
              </div>
            ))}
        </div>
      </div>
    </Stack>
  )
}

export default Sidebar
