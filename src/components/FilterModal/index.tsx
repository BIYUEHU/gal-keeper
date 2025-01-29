import { Modal } from '@fluentui/react/lib/Modal'
import { Stack } from '@fluentui/react/lib/Stack'
import { Toggle } from '@fluentui/react/lib/Toggle'
import { Text } from '@fluentui/react/lib/Text'
import { PrimaryButton } from '@fluentui/react'
import useStore from '@/store'
import { t } from '@/utils/i18n'

interface FilterModalProps {
  isOpen: boolean
  setIsOpen: (isOpen: boolean) => void
}

const FilterModal: React.FC<FilterModalProps> = ({ isOpen, setIsOpen }) => {
  const {
    settings: { sortOnlyDisplayLocal },
    updateSettings
  } = useStore((state) => state)

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
          {t`component.filterModal.title`}
        </Text>
        <Stack horizontal tokens={{ childrenGap: 16 }} className="mb-4">
          <Stack tokens={{ childrenGap: 8 }} className="flex-grow">
            <Toggle
              label={t`component.filterModal.field.onlyLocal`}
              checked={sortOnlyDisplayLocal}
              onText={t`component.filterModal.toggle.yes`}
              offText={t`component.filterModal.toggle.no`}
              onChange={(_, checked) => updateSettings({ sortOnlyDisplayLocal: checked })}
            />
          </Stack>
        </Stack>
        <Stack horizontal tokens={{ childrenGap: 16 }} horizontalAlign="end">
          <PrimaryButton text={t`component.filterModal.button.confirm`} onClick={() => setIsOpen(false)} />
        </Stack>
      </div>
    </Modal>
  )
}

export default FilterModal
