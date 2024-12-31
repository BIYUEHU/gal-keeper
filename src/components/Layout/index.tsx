import { useState } from 'react'
import { Stack } from '@fluentui/react/lib/Stack'
import { Sidebar } from '../Sidebar'

interface LayoutProps {
  title: string
  outlet: React.ReactElement
}

export const Layout: React.FC<LayoutProps> = ({ title, outlet }) => {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const toggleSidebar = () => setIsCollapsed((prev) => !prev)

  return (
    <Stack horizontal className="h-screen w-screen">
      <Stack.Item className="max-w-0">
        <Sidebar isCollapsed={isCollapsed} toggleSidebar={toggleSidebar} />
      </Stack.Item>
      <Stack.Item grow className={`px-8 max-w-full ${isCollapsed ? 'ml-13' : 'ml-64'}`}>
        <div className="h-full flex flex-col flex-1 p-6 ">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-semibold ">{title}</h2>
          </div>
          {outlet}
        </div>
      </Stack.Item>
    </Stack>
  )
}
