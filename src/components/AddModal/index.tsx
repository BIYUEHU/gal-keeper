import { useState, useEffect } from 'react'
import { Modal } from '@fluentui/react/lib/Modal'
import { Stack } from '@fluentui/react/lib/Stack'
import { PrimaryButton, DefaultButton } from '@fluentui/react'
import { TextField } from '@fluentui/react/lib/TextField'
import { Text } from '@fluentui/react/lib/Text'
import { open } from '@tauri-apps/plugin-dialog'

interface AddModalProps {
  isOpen: boolean
  setIsOpen: (isOpen: boolean) => void
}

export const AddModal: React.FC<AddModalProps> = ({ isOpen, setIsOpen }) => {
  const [programPath, setProgramPath] = useState<string>('')
  const [gameName, setGameName] = useState<string>('')

  useEffect(() => {
    if (isOpen) {
      setProgramPath('')
      setGameName('')
    }
  }, [isOpen])

  const handleSelectProgram = async () => {
    const filePath = await open({
      directory: false,
      multiple: false,
      canCreateDirectories: false,
      title: '选择游戏启动程序',
      filters: [{ name: 'EXE 文件', extensions: ['exe'] }]
    })
    if (filePath) {
      setProgramPath(filePath)
      const dirName = filePath.split(/[/\\]/).slice(-2, -1)[0] // 根据目录名生成游戏名字
      if (!gameName) setGameName(dirName)
    }
  }

  const handleSubmit = () => {
    if (gameName) {
      console.log('提交:', { programPath, gameName })
      setIsOpen(false)
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
          添加游戏
        </Text>
        <Stack tokens={{ childrenGap: 16 }}>
          <TextField
            label="游戏启动程序"
            value={programPath}
            readOnly
            onClick={handleSelectProgram}
            placeholder="选择一个 EXE 文件"
          />
          <PrimaryButton text="选择文件" onClick={handleSelectProgram} />
          <TextField label="游戏名字" value={gameName} onChange={(_, value) => setGameName(value || '')} required />
        </Stack>
        <Stack horizontal tokens={{ childrenGap: 16 }} horizontalAlign="end" className="mt-4">
          <DefaultButton text="取消" onClick={() => setIsOpen(false)} />
          <PrimaryButton text="提交" onClick={handleSubmit} />
        </Stack>
      </div>
    </Modal>
  )
}
