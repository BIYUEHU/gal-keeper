import { useState, useEffect } from 'react'
import { Modal } from '@fluentui/react/lib/Modal'
import { Stack } from '@fluentui/react/lib/Stack'
import { PrimaryButton, DefaultButton } from '@fluentui/react'
import { TextField } from '@fluentui/react/lib/TextField'
import { Text } from '@fluentui/react/lib/Text'
import { dialog } from '@tauri-apps/api'
import type { GameWithLocalData } from '@/types'
import useStore from '@/store'
import { t } from '@/utils/i18n'
import { invokeLogger } from '@/utils/logger'

interface SyncModalProps {
  isOpen: boolean
  setIsOpen: (isOpen: boolean) => void
  data: GameWithLocalData
}

const SyncModal: React.FC<SyncModalProps> = ({ isOpen, setIsOpen, data }) => {
  const [programFile, setProgramFile] = useState<string>('')
  const { updateGameData } = useStore((state) => state)

  useEffect(() => {
    if (isOpen) setProgramFile('')
  }, [isOpen])

  const handleSelectExe = async () => {
    const filepath = await dialog
      .open({
        title: t`component.syncModal.dialog.selectProgram`,
        directory: false,
        multiple: false,
        filters: [{ name: t`component.syncModal.dialog.filter.executable`, extensions: ['exe'] }]
      })
      .catch((e) => invokeLogger.error(e))
    if (filepath) setProgramFile(filepath as string)
  }

  const handleSubmit = () => {
    if (programFile) {
      setIsOpen(false)
      data.local = {
        ...(data.local ?? {
          id: data.id
        }),
        programFile
      }
      updateGameData(data)
    }
  }

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
          {t`component.syncModal.title`}
        </Text>
        <Stack tokens={{ childrenGap: 16 }}>
          <TextField
            label={t`component.syncModal.field.program`}
            value={programFile}
            readOnly
            onClick={handleSelectExe}
            placeholder={t`component.syncModal.field.program.placeholder`}
            autoComplete="off"
            required
          />
          <PrimaryButton text={t`component.syncModal.button.selectFile`} onClick={handleSelectExe} />
        </Stack>
        <Stack horizontal tokens={{ childrenGap: 16 }} horizontalAlign="end" className="mt-4">
          <DefaultButton text={t`component.syncModal.button.cancel`} onClick={() => setIsOpen(false)} />
          <PrimaryButton text={t`component.syncModal.button.submit`} onClick={handleSubmit} />
        </Stack>
      </div>
    </Modal>
  )
}

export default SyncModal
