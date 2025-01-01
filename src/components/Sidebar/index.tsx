import { useState } from 'react'
import { Stack } from '@fluentui/react/lib/Stack'
import { Icon } from '@fluentui/react/lib/Icon'
import routes from '@/routes'
import { useLocation, useNavigate } from 'react-router-dom'
import useStore from '@/store'

export const Sidebar: React.FC = () => {
  const sidebar = useStore((state) => state.sidebar)
  const toggleSidebar = useStore((state) => state.toggleSidebar)
  const navigate = useNavigate()
  const location = useLocation()
  const [selectedKey, setSelectedKey] = useState(location.pathname)
  const handleNavigation = (key: string) => {
    setSelectedKey(key)
    navigate(key)
  }

  return (
    <Stack className={`h-screen bg-gray-50 ${sidebar ? 'w-64' : 'w-13'}`}>
      <div className="space-y-1">
        <div
          className="mt-2 w-7 h-7 flex items-center mx-1 p-2 cursor-pointer hover:bg-gray-200"
          onClick={toggleSidebar}
        >
          <Icon iconName="GlobalNavButton" className="ml-2 scale-120" />
        </div>
        {routes
          .filter((item) => item.icon)
          .map((item) => (
            <div
              className={`h-6 flex items-center mx-1 p-2 cursor-pointer ${item.path === selectedKey ? 'bg-gray-200' : 'hover:bg-gray-200'}`}
              key={item.path}
              onClick={() => handleNavigation(item.path)}
            >
              <Icon iconName={item.icon} className="ml-2 scale-120" />
              {sidebar && <span className="ml-2">{item.title}</span>}
            </div>
          ))}
      </div>
    </Stack>
  )
}
