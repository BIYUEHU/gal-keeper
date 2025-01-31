import { useState, useEffect } from 'react'
import { Modal } from '@fluentui/react/lib/Modal'
import { Stack } from '@fluentui/react/lib/Stack'
import { PrimaryButton, DefaultButton } from '@fluentui/react'
import { TextField } from '@fluentui/react/lib/TextField'
import { Text } from '@fluentui/react/lib/Text'
import useStore from '@/store'
import type { Category, Group } from '@/types'
import { t } from '@/utils/i18n'

type GroupModalProps = {
  isOpen: boolean
  setIsOpen: (isOpen: boolean) => void
} & (
  | {
      groupId: undefined
      setData: (data: Group[]) => void
    }
  | {
      groupId: string
      setData: (data: Category[]) => void
    }
)

const GroupModal: React.FC<GroupModalProps> = ({ isOpen, setIsOpen, setData, groupId }) => {
  const [name, setName] = useState('')

  const { addGroup, addCategory } = useStore((state) => state)

  useEffect(() => {
    if (isOpen) setName('')
  }, [isOpen])

  const handleSubmit = async () => {
    if (!name) return
    if (groupId) {
      addCategory(groupId, name)
      setData(useStore.getState().categories)
    } else if (groupId === undefined) {
      addGroup(name)
      setData(useStore.getState().groups)
    }
    setIsOpen(false)
  }

  return (
    <Modal
      isOpen={isOpen}
      isClickableOutsideFocusTrap={false}
      isBlocking={false}
      styles={{
        main: { width: 400, maxWidth: '90%' }
      }}
    >
      <div className="p-6 bg-white rounded-md shadow-md">
        <Text variant="xLarge" className="font-semibold mb-4">
          {groupId ? t`component.groupModal.title.category` : t`component.groupModal.title.group`}
        </Text>
        <Stack tokens={{ childrenGap: 16 }}>
          <TextField
            label={t`component.groupModal.field.name`}
            value={name}
            onChange={(_, value) => setName(value ?? '')}
            required
            autoComplete="off"
          />
        </Stack>
        <Stack horizontal tokens={{ childrenGap: 16 }} horizontalAlign="end" className="mt-4">
          <DefaultButton text={t`component.addModal.button.cancel`} onClick={() => setIsOpen(false)} />
          <PrimaryButton text={t`component.addModal.button.submit`} onClick={handleSubmit} />
        </Stack>
      </div>
    </Modal>
  )
}

export default GroupModal
