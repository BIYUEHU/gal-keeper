import { Stack } from '@fluentui/react/lib/Stack'
import { Sidebar } from '../Sidebar'
import { Spinner } from '@fluentui/react-components'
import { useUI } from '@/contexts/UIContext'
import { AlertBox } from '../AlertBox'
import { useEffect } from 'react'
import events from '@/utils/events'
import { type LoggerData, LoggerLevel } from '@kotori-bot/logger'
import { t } from '@/utils/i18n'

interface LayoutProps {
  title: string
  outlet: React.ReactElement
}

export const Layout: React.FC<LayoutProps> = ({ title, outlet }) => {
  const {
    state: { fullLoading, sidebarOpen },
    openAlert
  } = useUI()

  useEffect(() => {
    events.on('error', (data: LoggerData) => {
      if (data.label.length === 0) return
      if (data.label[0] === 'HTTP') {
        openAlert(data.msg, t`alert.title.error.http`)
      } else if (data.level === LoggerLevel.FATAL) {
        openAlert(data.msg, t`alert.title.error.fatal`)
      } else {
        openAlert(data.msg, t`alert.title.error`)
      }
    })
  }, [openAlert])

  return (
    <Stack horizontal className="h-screen w-screen">
      <AlertBox />
      {fullLoading && (
        <div className="fixed inset-0 z-50 flex justify-center items-center bg-black/50 shadow-lg">
          <Spinner size="extra-large" />
        </div>
      )}
      <Stack.Item className="max-w-0">
        <Sidebar />
      </Stack.Item>
      <Stack.Item grow className={`px-8 max-w-full ${sidebarOpen ? 'ml-64' : 'ml-13'}`}>
        <div className="h-full flex flex-col flex-1 pt-5 max-h-90vh">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-semibold ">{title}</h2>
          </div>
          {outlet}
        </div>
      </Stack.Item>
    </Stack>
  )
}
