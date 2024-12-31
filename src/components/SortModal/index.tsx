import { Modal } from '@fluentui/react/lib/Modal'
import { Stack } from '@fluentui/react/lib/Stack'
import { Dropdown } from '@fluentui/react/lib/Dropdown'
import { Toggle } from '@fluentui/react/lib/Toggle'
import { Text } from '@fluentui/react/lib/Text'
import { PrimaryButton } from '@fluentui/react'

export type SortKeys = 'Title' | 'CreateDate' | 'LastPlay' | 'Developer' | 'Rating' | 'ReleaseDate'

interface SortModalProps {
  isOpen: boolean
  setIsOpen: (isOpen: boolean) => void
  primaryKey: SortKeys
  setPrimaryKey: (key: SortKeys) => void
  isPrimaryDescending: boolean
  setIsPrimaryDescending: (value: boolean) => void
}

export const SortModal: React.FC<SortModalProps> = ({
  isOpen,
  setIsOpen,
  primaryKey,
  setPrimaryKey,
  isPrimaryDescending,
  setIsPrimaryDescending
}) => {
  const dropdownOptions: { key: SortKeys; text: string }[] = [
    { key: 'CreateDate', text: '创建时间' },
    { key: 'Title', text: '标题' },
    { key: 'LastPlay', text: '最近玩过' },
    { key: 'Developer', text: '开发商' },
    { key: 'Rating', text: '评分' },
    { key: 'ReleaseDate', text: '发行时间' }
  ]

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
          排序
        </Text>
        <Stack horizontal tokens={{ childrenGap: 16 }} className="mb-4">
          <Stack tokens={{ childrenGap: 8 }} className="flex-grow">
            <Dropdown
              options={dropdownOptions}
              selectedKey={primaryKey}
              onChange={(_, option) => setPrimaryKey(option?.key as SortKeys)}
            />
            <Toggle
              label="降序/升序"
              checked={isPrimaryDescending}
              onText="降序"
              offText="升序"
              onChange={(_, checked) => setIsPrimaryDescending(checked || false)}
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
