import { useState, useEffect } from 'react'
import { Modal } from '@fluentui/react/lib/Modal'
import { Stack } from '@fluentui/react/lib/Stack'
import { PrimaryButton, DefaultButton } from '@fluentui/react'
import { TextField } from '@fluentui/react/lib/TextField'
import { Text } from '@fluentui/react/lib/Text'
import { open } from '@tauri-apps/plugin-dialog'
import { IS_TAURI } from '@/constant'
import useStore, { useSharedStore } from '@/store'
import { fetchGameData } from '@/api'
import { generateUuid } from '@/utils'
import type { GameWithLocalData } from '@/types'

interface AddModalProps {
  isOpen: boolean
  setIsOpen: (isOpen: boolean) => void
  data: GameWithLocalData[]
  setData: (data: GameWithLocalData[]) => void
}

export const AddModal: React.FC<AddModalProps> = ({ isOpen, setIsOpen, data, setData }) => {
  const [programFile, setProgramFile] = useState<string>('')
  const [gameName, setGameName] = useState<string>('')
  const getSettingsField = useStore((state) => state.getSettingsField)
  const { openFullLoading } = useStore((state) => state)
  const { addData } = useSharedStore((state) => state)

  useEffect(() => {
    if (isOpen) {
      setProgramFile('')
      setGameName('')
    }
  }, [isOpen])

  const handleSelectProgram = async () => {
    const filepath = await open({
      title: '选择启动程序',
      directory: false,
      canCreateDirectories: false,
      multiple: false,
      filters: [{ name: '可执行文件', extensions: ['exe'] }]
    })
    if (filepath) {
      setProgramFile(filepath)
      if (!gameName) setGameName(filepath.split(/[/\\]/).slice(-2, -1)[0])
    }
  }

  const handleSubmit = async () => {
    if (gameName) {
      const close = openFullLoading()
      setIsOpen(false)

      const id = generateUuid()
      const game: GameWithLocalData = {
        id,
        title: gameName,
        alias: [],
        cover: '/assets/cover.png',
        description: '',
        tags: [],
        palyTimelines: [],
        expectedPlayHours: 0,
        lastPlay: 0,
        createDate: Date.now(),
        releaseDate: 0,
        rating: 0,
        developer: '',
        images: [],
        links: [],
        local: programFile
          ? {
              id,
              // TODO: auto find save and guide file
              // ...(await invoke('search_nearby_files_and_saves')),
              programFile
            }
          : undefined,
        ...((await fetchGameData(getSettingsField('fetchMethods'), gameName)) ?? {})
      }
      addData(game)
      setData([...data, game])
      close()
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
            disabled={!IS_TAURI}
            label="启动程序"
            value={programFile}
            readOnly
            onClick={handleSelectProgram}
            placeholder="选择一个可执行文件"
          />
          <PrimaryButton disabled={!IS_TAURI} text="选择文件" onClick={handleSelectProgram} />
          <TextField
            label="游戏名字"
            value={gameName}
            onChange={(_, value) => setGameName(value || '')}
            required
            autoComplete="off"
          />
        </Stack>
        <Stack horizontal tokens={{ childrenGap: 16 }} horizontalAlign="end" className="mt-4">
          <DefaultButton text="取消" onClick={() => setIsOpen(false)} />
          <PrimaryButton text="提交" onClick={handleSubmit} />
        </Stack>
      </div>
    </Modal>
  )
}
