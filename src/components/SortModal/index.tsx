import { Modal } from '@fluentui/react/lib/Modal'
import { Stack } from '@fluentui/react/lib/Stack'
import { Dropdown } from '@fluentui/react/lib/Dropdown'
import { Toggle } from '@fluentui/react/lib/Toggle'
import { Text } from '@fluentui/react/lib/Text'
import { PrimaryButton } from '@fluentui/react'
import useStore from '@/store'
import type { SortKeys } from '@/types'
import { t } from '@/utils/i18n'

interface SortModalProps {
  isOpen: boolean
  setIsOpen: (isOpen: boolean) => void
}
const dropdownOptions: { key: SortKeys; text: string }[] = [
  { key: 'CreateDate', text: t`component.sortModal.sort.createDate` },
  { key: 'Title', text: t`component.sortModal.sort.title` },
  { key: 'LastPlay', text: t`component.sortModal.sort.lastPlay` },
  { key: 'Developer', text: t`component.sortModal.sort.developer` },
  { key: 'Rating', text: t`component.sortModal.sort.rating` },
  { key: 'ReleaseDate', text: t`component.sortModal.sort.releaseDate` }
]

export const SortModal: React.FC<SortModalProps> = ({ isOpen, setIsOpen }) => {
  const primaryKey = useStore((state) => state.sort.primaryKey)
  const isPrimaryDescending = useStore((state) => state.sort.isPrimaryDescending)
  const setSort = useStore((state) => state.setSort)

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
          {t`component.sortModal.title`}
        </Text>
        <Stack horizontal tokens={{ childrenGap: 16 }} className="mb-4">
          <Stack tokens={{ childrenGap: 8 }} className="flex-grow">
            <Dropdown
              options={dropdownOptions}
              selectedKey={primaryKey}
              onChange={(_, option) => setSort({ primaryKey: (option?.key || 'Title') as SortKeys })}
            />
            <Toggle
              label={t`component.sortModal.toggle.label`}
              checked={isPrimaryDescending}
              onText={t`component.sortModal.toggle.descending`}
              offText={t`component.sortModal.toggle.ascending`}
              onChange={(_, checked) => setSort({ isPrimaryDescending: checked })}
            />
          </Stack>
        </Stack>
        <Stack horizontal tokens={{ childrenGap: 16 }} horizontalAlign="end">
          <PrimaryButton text={t`component.sortModal.button.confirm`} onClick={() => setIsOpen(false)} />
        </Stack>
      </div>
    </Modal>
  )
}
