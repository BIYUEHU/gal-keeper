import { useState, useEffect } from 'react'
import { Modal } from '@fluentui/react/lib/Modal'
import { Stack } from '@fluentui/react/lib/Stack'
import { PrimaryButton, DefaultButton } from '@fluentui/react'
import { TextField } from '@fluentui/react/lib/TextField'
import { Text } from '@fluentui/react/lib/Text'
import { dialog } from '@tauri-apps/api'
import { IS_TAURI } from '@/constant'
import useStore, { useSharedStore } from '@/store'
import { fetchGameData } from '@/api'
import { cacheImage, generateUuid } from '@/utils'
import type { GameWithLocalData } from '@/types'
import { t } from '@/utils/i18n'

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
    const filepath = await dialog.open({
      title: t`component.addModal.dialog.selectProgram`,
      directory: false,
      multiple: false,
      filters: [{ name: t`component.addModal.dialog.filter.executable`, extensions: ['exe'] }]
    })
    if (filepath) {
      setProgramFile(filepath as string)
      if (!gameName) setGameName((filepath as string).split(/[/\\]/).slice(-2, -1)[0])
    }
  }

  const handleSubmit = async () => {
    if (gameName) {
      const close = openFullLoading()
      setIsOpen(false)

      const id = generateUuid()
      const fetchData = await fetchGameData(getSettingsField('fetchMethods'), gameName)
      const game: GameWithLocalData = {
        id,
        title: gameName,
        alias: [],
        description: '',
        tags: [],
        playTimelines: [],
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
        ...fetchData,
        ...{
          cover:
            fetchData?.cover && IS_TAURI && getSettingsField('autoCacheGameCover')
              ? await cacheImage(fetchData.cover).finally(close)
              : (fetchData?.cover ?? '/assets/cover.png')
        }
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
          {t`component.addModal.title`}
        </Text>
        <Stack tokens={{ childrenGap: 16 }}>
          <TextField
            disabled={!IS_TAURI}
            label={t`component.addModal.field.program`}
            value={programFile}
            readOnly
            onClick={handleSelectProgram}
            placeholder={t`component.addModal.field.program.placeholder`}
          />
          <PrimaryButton
            disabled={!IS_TAURI}
            text={t`component.addModal.button.selectFile`}
            onClick={handleSelectProgram}
          />
          <TextField
            label={t`component.addModal.field.name`}
            value={gameName}
            onChange={(_, value) => setGameName(value || '')}
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
