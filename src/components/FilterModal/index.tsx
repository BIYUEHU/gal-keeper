import { Modal } from '@fluentui/react/lib/Modal'
import { Stack } from '@fluentui/react/lib/Stack'
import { Toggle } from '@fluentui/react/lib/Toggle'
import { Text } from '@fluentui/react/lib/Text'
import { PrimaryButton } from '@fluentui/react'
import useStore from '@/store'

interface FilterModalProps {
  isOpen: boolean
  setIsOpen: (isOpen: boolean) => void
}

export const FilterModal: React.FC<FilterModalProps> = ({ isOpen, setIsOpen }) => {
  const { onlyDisplayLocal } = useStore((state) => state.filter)
  const { setFilter } = useStore((state) => state)

  return (
    <Modal
      isOpen={isOpen}
      isBlocking={false}
      styles={{
        main: { width: 400, maxWidth: '90%' }
      }}
    >
      <div className="p-6 bg-white rounded-md shadow-md">
        <Text variant="xLarge" className="font-semibold mb-4">
          筛选
        </Text>
        <Stack horizontal tokens={{ childrenGap: 16 }} className="mb-4">
          <Stack tokens={{ childrenGap: 8 }} className="flex-grow">
            <Toggle
              label="仅显示本地游戏"
              checked={onlyDisplayLocal}
              onText="是"
              offText="否"
              onChange={(_, checked) => setFilter({ onlyDisplayLocal: checked })}
            />
          </Stack>
        </Stack>
        <Stack horizontal tokens={{ childrenGap: 16 }} horizontalAlign="end">
          <PrimaryButton text="确定" onClick={() => setIsOpen(false)} />
        </Stack>
      </div>
    </Modal>
  )
}
