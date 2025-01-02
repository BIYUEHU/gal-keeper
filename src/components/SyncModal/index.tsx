import { useState, useEffect } from 'react'
import { Modal } from '@fluentui/react/lib/Modal'
import { Stack } from '@fluentui/react/lib/Stack'
import { PrimaryButton, DefaultButton } from '@fluentui/react'
import { TextField } from '@fluentui/react/lib/TextField'
import { Text } from '@fluentui/react/lib/Text'
import { open } from '@tauri-apps/plugin-dialog'
import type { GameWithLocalData } from '@/types'
import { useSharedStore } from '@/store'

interface SyncModalProps {
  isOpen: boolean
  setIsOpen: (isOpen: boolean) => void
  data: GameWithLocalData
}

export const SyncModal: React.FC<SyncModalProps> = ({ isOpen, setIsOpen, data }) => {
  const [programFile, setProgramFile] = useState<string>('')
  const { updateData } = useSharedStore((state) => state)

  useEffect(() => {
    if (isOpen) setProgramFile('')
  }, [isOpen])

  const handleSelectExe = async () => {
    const filepath = await open({
      title: '选择启动程序',
      directory: false,
      canCreateDirectories: false,
      multiple: false,
      filters: [{ name: '可执行文件', extensions: ['exe'] }]
    })
    if (filepath) setProgramFile(filepath)
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
      updateData(data)
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
          同步游戏
        </Text>
        <Stack tokens={{ childrenGap: 16 }}>
          <TextField
            label="启动程序"
            value={programFile}
            readOnly
            onClick={handleSelectExe}
            placeholder="选择一个可执行文件"
            required
          />
          <PrimaryButton text="选择文件" onClick={handleSelectExe} />
        </Stack>
        <Stack horizontal tokens={{ childrenGap: 16 }} horizontalAlign="end" className="mt-4">
          <DefaultButton text="取消" onClick={() => setIsOpen(false)} />
          <PrimaryButton text="提交" onClick={handleSubmit} />
        </Stack>
      </div>
    </Modal>
  )
}
