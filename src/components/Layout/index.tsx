import { Stack } from '@fluentui/react/lib/Stack'
import { Sidebar } from '../Sidebar'
import useStore from '@/store'
import { AlertBox } from '../AlertBox'
import { Spinner } from '@fluentui/react-components'

interface LayoutProps {
  title: string
  outlet: React.ReactElement
}

export const Layout: React.FC<LayoutProps> = ({ title, outlet }) => {
  const { sidebar } = useStore((state) => state)
  const { fullLoadingIsOpen } = useStore((state) => state.temps)

  return (
    <Stack horizontal className="h-screen w-screen">
      <AlertBox />
      {fullLoadingIsOpen && (
        <div className="fixed inset-0 z-50 flex justify-center items-center bg-black/50 shadow-lg">
          <Spinner size="extra-large" />
        </div>
      )}
      <Stack.Item className="max-w-0">
        <Sidebar />
      </Stack.Item>
      <Stack.Item grow className={`px-8 max-w-full ${sidebar ? 'ml-64' : 'ml-13'}`}>
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
