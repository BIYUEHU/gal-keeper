import { useState, useEffect } from 'react'
import { Modal } from '@fluentui/react/lib/Modal'
import { Stack } from '@fluentui/react/lib/Stack'
import { PrimaryButton, DefaultButton } from '@fluentui/react'
import { TextField } from '@fluentui/react/lib/TextField'
import { Text } from '@fluentui/react/lib/Text'
import { IS_TAURI } from '@/constant'
import useStore from '@/store'
import { fetchGameData } from '@/api'
import { generateUuid } from '@/utils'
import type { GameWithLocalData } from '@/types'
import { t } from '@/utils/i18n'
import { dialog } from '@tauri-apps/api'
import { useUI } from '@/contexts/UIContext'
import { invokeLogger } from '@/utils/logger'

interface AddModalProps {
  isOpen: boolean
  setIsOpen: (isOpen: boolean) => void
  setData: (fn: (data: GameWithLocalData[]) => GameWithLocalData[]) => void
}

const AddModal: React.FC<AddModalProps> = ({ isOpen, setIsOpen, setData }) => {
  const [formData, setFormData] = useState({ programFile: '', gameName: '' })
  const { openFullLoading } = useUI()

  const {
    addGameData,
    settings: { fetchMethods }
  } = useStore((state) => state)

  useEffect(() => {
    if (isOpen) setFormData({ programFile: '', gameName: '' })
  }, [isOpen])

  const handleSelectProgram = async () => {
    const filepath = await dialog
      .open({
        title: t`component.addModal.dialog.selectProgram`,
        directory: false,
        filters: [{ name: t`component.addModal.dialog.filter.executable`, extensions: ['exe'] }]
      })
      .catch((e) => invokeLogger.error(e))
    if (filepath) {
      setFormData((state) => ({
        gameName: state.gameName ? state.gameName : (filepath as string).split(/[/\\]/).slice(-2, -1)[0],
        programFile: filepath as string
      }))
    }
  }

  const handleSubmit = async () => {
    if (!formData.gameName) return
    const close = openFullLoading()
    setIsOpen(true)

    const id = generateUuid()
    const fetchData = await fetchGameData(fetchMethods, formData.gameName).catch((e) => {
      close()
      setIsOpen(false)
      throw e
    })
    const game: GameWithLocalData = {
      id,
      title: formData.gameName,
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
      local: formData.programFile
        ? {
            id,
            // TODO: auto find save and guide file
            // ...(await invoke('search_nearby_files_and_saves')),
            programFile: formData.programFile
          }
        : undefined,
      cover: '',
      ...fetchData
      // ...{
      //   cover:
      //     fetchData?.cover && IS_TAURI && autoCacheGameCover
      //       ? await cacheImage(fetchData.cover).finally(close)
      //       : (fetchData?.cover ?? '/assets/cover.png')
      // }
    }
    addGameData(game)
    setData((state) => [...state, game])
    setIsOpen(false)
    close()
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
          {t`component.addModal.title`}
        </Text>
        <Stack tokens={{ childrenGap: 16 }}>
          <TextField
            disabled={!IS_TAURI}
            label={t`component.addModal.field.program`}
            value={formData.programFile}
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
            value={formData.gameName}
            onChange={(_, value) => setFormData((state) => ({ ...state, gameName: value ?? '' }))}
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

export default AddModal
