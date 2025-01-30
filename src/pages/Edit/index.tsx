import React, { useState } from 'react'
import type { FetchMethods, GameWithLocalData, LocalData } from '@/types'
import { useNavigate, useParams } from 'react-router-dom'
import useStore from '@/store'
import { DefaultButton, PrimaryButton, Stack, TextField } from '@fluentui/react'
import { dialog } from '@tauri-apps/api'
import { Dropdown } from '@fluentui/react/lib/Dropdown'
import { Spinner } from '@fluentui/react-components'
import { fetchGameData } from '@/api'
import { IS_TAURI } from '@/constant'
import { cacheImage } from '@/utils'
import { t } from '@/utils/i18n'
import { useUI } from '@/contexts/UIContext'
import { invokeLogger } from '@/utils/logger'

const dropdownOptions: { key: FetchMethods; text: string }[] = [
  { key: 'mixed', text: t`page.edit.dropdown.mixed` },
  { key: 'vndb', text: t`page.edit.dropdown.vndb` },
  { key: 'bgm', text: t`page.edit.dropdown.bgm` }
]

const Edit = () => {
  const { id } = useParams()
  const game = useStore((state) => state.getGameData)(id ?? '')

  if (!game) {
    return <div>{t`page.edit.game.notFound`}</div>
  }

  const {
    settings: { autoSetGameTitle, autoCacheImage, fetchMethods },
    updateGameData
  } = useStore((state) => state)
  const [fetchMethod, setFetchMethod] = useState<FetchMethods>(fetchMethods)
  const navigate = useNavigate()
  const [editedGame, setEditedGame] = useState(game)
  const [isLoading, setIsLoading] = useState(false)
  const { openFullLoading } = useUI()

  const updateField = <T extends Exclude<keyof GameWithLocalData, 'id' | 'local'>>(
    key: T,
    value: GameWithLocalData[T]
  ) => {
    setEditedGame({
      ...editedGame,
      [key]: value
    } as GameWithLocalData)
  }

  const updateLocalDataField = <T extends keyof LocalData>(key: T, value: LocalData[T]) => {
    setEditedGame({
      ...editedGame,
      local: {
        ...editedGame.local,
        [key]: value
      }
    } as GameWithLocalData)
  }

  const handleSave = async (data: GameWithLocalData) => {
    const close = openFullLoading()
    updateGameData({
      ...data,
      ...{
        cover: data.cover && IS_TAURI && autoCacheImage ? await cacheImage(data.cover) : data.cover
      }
    })
    close()
    navigate(-1)
  }

  const handleFetchData = async () => {
    setIsLoading(true)
    const fetchData = await fetchGameData(fetchMethod, editedGame.title, [editedGame.bgmId, editedGame.vndbId]).finally(
      () => {
        setIsLoading(false)
      }
    )
    setEditedGame({
      ...editedGame,
      ...fetchData,
      ...{ title: fetchData && autoSetGameTitle ? fetchData.title : editedGame.title }
    })
  }

  const handleSelectSavePath = async () => {
    const savePath = await dialog.open({
      title: t`page.edit.dialog.selectSave`,
      directory: true,
      multiple: false
    })
    if (savePath) updateLocalDataField('savePath', savePath as string)
  }

  const handleSelectProgramFile = async () => {
    const programFile = await dialog
      .open({
        title: t`page.edit.dialog.selectProgram`,
        directory: false,
        multiple: false,
        filters: [{ name: t`page.edit.dialog.filter.executable`, extensions: ['exe'] }]
      })
      .catch((e) => invokeLogger.error(e))
    if (programFile) updateLocalDataField('programFile', programFile as string)
  }

  const handleSelectGuideFile = async () => {
    const guideFile = await dialog
      .open({
        title: t`page.edit.dialog.selectGuide`,
        directory: false,
        multiple: false,
        filters: [
          {
            name: t`page.edit.dialog.filter.textFile`,
            extensions: ['txt', 'md', 'html', 'htm', 'pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx']
          }
        ]
      })
      .catch((e) => invokeLogger.error(e))
    if (guideFile) updateLocalDataField('guideFile', guideFile as string)
  }

  return (
    <React.Fragment>
      <h2 className="text-2xl font-semibold">{game.title}</h2>
      <div className="overflow-auto px-4 children:children:children:my-1">
        <Stack tokens={{ childrenGap: 8 }}>
          <Stack horizontal tokens={{ childrenGap: 16 }} verticalAlign="center">
            <h2 className="text-lg font-semibold">{t`page.edit.section.basicInfo`}</h2>
          </Stack>
          <Stack horizontal tokens={{ childrenGap: 16 }} verticalAlign="center">
            <h3 className="font-semibold w-13">{t`page.edit.field.source`}</h3>
            <Dropdown
              options={dropdownOptions}
              selectedKey={fetchMethod}
              className="w-25"
              onChange={(_, option) => setFetchMethod(option?.key as FetchMethods)}
            />
            <DefaultButton text={t`page.edit.button.fetchData`} onClick={handleFetchData} />
            {isLoading && <Spinner />}
            {['bgm', 'mixed'].includes(fetchMethod) && (
              <>
                <h4 className="font-semibold w-13">Bgm Id</h4>
                <TextField
                  value={editedGame.bgmId}
                  onChange={(_, value) => updateField('bgmId', value || '')}
                  className="max-w-20 flex-grow-1"
                  autoComplete="off"
                />
              </>
            )}
            {['vndb', 'mixed'].includes(fetchMethod) && (
              <>
                <h4 className="font-semibold w-13">Vndb Id</h4>
                <TextField
                  value={editedGame.vndbId}
                  onChange={(_, value) => updateField('vndbId', value || '')}
                  className="max-w-20 flex-grow-1"
                  autoComplete="off"
                />
              </>
            )}
          </Stack>
          <Stack horizontal tokens={{ childrenGap: 16 }} verticalAlign="center">
            <h3 className="font-semibold w-13">{t`page.edit.field.title`}</h3>
            <TextField
              value={editedGame.title}
              onChange={(_, value) => updateField('title', value || '')}
              required
              className="flex-grow-1"
              autoComplete="off"
            />
          </Stack>
          <Stack horizontal tokens={{ childrenGap: 16 }} verticalAlign="center">
            <h3 className="font-semibold w-13">{t`page.edit.field.developer`}</h3>
            <TextField
              value={editedGame.developer}
              onChange={(_, value) => updateField('developer', value || '')}
              className="flex-grow-1"
              autoComplete="off"
            />
          </Stack>
          <Stack horizontal tokens={{ childrenGap: 16 }} verticalAlign="center">
            <h3 className="font-semibold w-9">{t`page.edit.field.description`}</h3>
            <TextField
              value={editedGame.description}
              multiline
              rows={14}
              onChange={(_, value) => updateField('description', value || '')}
              className="flex-grow-1"
              autoComplete="off"
            />
          </Stack>
          <Stack horizontal tokens={{ childrenGap: 16 }} verticalAlign="center">
            <h3 className="font-semibold w-9">{t`page.edit.field.tags`}</h3>
            <TextField
              value={editedGame.tags.join(', ')}
              onChange={(_, value) =>
                updateField(
                  'tags',
                  (value || '').split(',').map((v) => v.trim())
                )
              }
              placeholder={t`page.edit.field.tags.placeholder`}
              className="flex-grow-1"
              autoComplete="off"
            />
          </Stack>
          <Stack horizontal tokens={{ childrenGap: 16 }} verticalAlign="center">
            <h3 className="font-semibold w-13">{t`page.edit.field.cover`}</h3>
            <TextField
              value={editedGame.cover}
              onChange={(_, value) => updateField('cover', value || '')}
              className="flex-grow-1"
              autoComplete="off"
            />
          </Stack>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Stack horizontal tokens={{ childrenGap: 5 }} verticalAlign="center">
              <h3 className="font-semibold w-22">{t`page.edit.field.expectedHours`}</h3>
              <TextField
                type="number"
                value={editedGame.expectedPlayHours.toString()}
                onChange={(_, value) => updateField('expectedPlayHours', Number(value ?? '0'))}
                className="flex-grow-1"
                autoComplete="off"
              />
            </Stack>
            <Stack horizontal tokens={{ childrenGap: 5 }} verticalAlign="center">
              <h3 className="font-semibold w-9">{t`page.edit.field.rating`}</h3>
              <TextField
                type="number"
                value={editedGame.rating.toString()}
                onChange={(_, value) => updateField('rating', Number(value ?? '0'))}
                className="flex-grow-1"
                autoComplete="off"
              />
            </Stack>
            <Stack horizontal tokens={{ childrenGap: 6 }} verticalAlign="center">
              <h3 className="font-semibold w-22">{t`page.edit.field.releaseDate`}</h3>
              <TextField
                type="date"
                value={new Date(editedGame.releaseDate).toISOString().split('T')[0]}
                onChange={(_, value) => updateField('releaseDate', new Date(value || '').getTime())}
                className="flex-grow-1"
                autoComplete="off"
              />
            </Stack>
          </div>
        </Stack>

        <Stack tokens={{ childrenGap: 8 }} className="mt-4">
          <Stack horizontal tokens={{ childrenGap: 16 }} verticalAlign="center">
            <h2 className="text-lg font-semibold">{t`page.edit.section.localSettings`}</h2>
          </Stack>
          {editedGame.local ? (
            <React.Fragment>
              <Stack horizontal tokens={{ childrenGap: 16 }} verticalAlign="center">
                <h3 className="font-semibold w-17">{t`page.edit.field.savePath`}</h3>
                <TextField
                  value={editedGame.local.savePath}
                  readOnly
                  onClick={handleSelectSavePath}
                  placeholder={t`page.edit.field.savePath.placeholder`}
                  className="flex-grow-1"
                  autoComplete="off"
                />
              </Stack>
              <Stack horizontal tokens={{ childrenGap: 16 }} verticalAlign="center">
                <h3 className="font-semibold w-17">{t`page.edit.field.programFile`}</h3>
                <TextField
                  value={editedGame.local.programFile}
                  readOnly
                  onClick={handleSelectProgramFile}
                  placeholder={t`page.edit.field.programFile.placeholder`}
                  className="flex-grow-1"
                  autoComplete="off"
                />
              </Stack>
              {/* TODO: Sync guide text file */}
              <Stack horizontal tokens={{ childrenGap: 16 }} verticalAlign="center">
                <h3 className="font-semibold w-17">{t`page.edit.field.guideFile`}</h3>
                <TextField
                  value={editedGame.local.guideFile}
                  readOnly
                  onClick={handleSelectGuideFile}
                  placeholder={t`page.edit.field.guideFile.placeholder`}
                  className="flex-grow-1"
                  autoComplete="off"
                />
              </Stack>
            </React.Fragment>
          ) : (
            <h3 className="text-red">{t`page.edit.text.needSync`}</h3>
          )}
        </Stack>

        <Stack horizontal tokens={{ childrenGap: 16 }} horizontalAlign="end" className="mt-6">
          <DefaultButton text={t`page.edit.button.cancel`} onClick={() => navigate(-1)} />
          <PrimaryButton text={t`page.edit.button.save`} onClick={() => handleSave(editedGame)} />
        </Stack>
      </div>
    </React.Fragment>
  )
}

export default Edit
