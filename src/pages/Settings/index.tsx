import { getRepoInfo, syncToGithub } from '@/api/github'
import { IS_TAURI } from '@/constant'
import { useUI } from '@/contexts/UIContext'
import useStore, { type RootState, DEFAULT_STATE } from '@/store'
import { type FetchMethods, gameDataListSchema } from '@/types'
import { generateUuid, openUrl } from '@/utils'
import { t } from '@/utils/i18n'
import logger, { invokeLogger } from '@/utils/logger'
import { Stack, TextField, ChoiceGroup, Toggle, Separator, DefaultButton, Text, PrimaryButton } from '@fluentui/react'
import { Dropdown } from '@fluentui/react/lib/Dropdown'
import { Spinner } from '@fluentui/react-components'
import { dialog } from '@tauri-apps/api'
import { readTextFile, writeBinaryFile } from '@tauri-apps/api/fs'
import React, { useState } from 'react'

const Settings: React.FC = () => {
  const { updateSettings, importGameData } = useStore((state) => state)
  const [settings, setSettings] = useState(useStore((state) => state.settings))
  const [sync, setSync] = useState(useStore((state) => state.sync))
  const { openAlert } = useUI()
  const [isLoading, setIsLoading] = useState(false)

  const checkParams = () => settings.githubToken && settings.githubRepo && settings.githubPath

  const handleExport = async () => {
    const jsonString = JSON.stringify(useStore.getState().gameData, null, 2)
    const blob = new Blob([jsonString], { type: 'application/json' })

    if (IS_TAURI) {
      const filePath = await dialog.save({
        filters: [
          {
            name: 'JSON',
            extensions: ['json']
          }
        ]
      })

      if (filePath) await writeBinaryFile(filePath, await blob.arrayBuffer())
    } else {
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `game-data-${generateUuid()}.json`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    }
  }

  const handleImport = async () => {
    if (IS_TAURI) {
      const selectedFile = await dialog
        .open({
          multiple: false,
          filters: [
            {
              name: 'JSON',
              extensions: ['json']
            }
          ]
        })
        .catch((e) => {
          invokeLogger.error(`Error while opening file dialog: ${e}`)
          throw e
        })

      if (!selectedFile) return
      try {
        importGameData(gameDataListSchema.parse(JSON.parse(await readTextFile(selectedFile as string))))
      } catch (error) {
        logger.error(error)
      }
    } else {
      await new Promise((resolve, reject) => {
        const input = document.createElement('input')
        input.type = 'file'
        input.accept = 'application/json'
        input.onchange = (event) => {
          const file = (event.target as HTMLInputElement).files?.[0]
          if (file) {
            const reader = new FileReader()
            reader.onload = () => {
              try {
                importGameData(gameDataListSchema.parse(JSON.parse(reader.result?.toString() ?? '')))
                resolve(undefined)
              } catch (error) {
                reject(error)
              }
            }
            reader.readAsText(file)
          } else {
            reject(new Error('No file selected'))
          }
        }
        input.click()
      }).catch((e) => logger.error(e))
    }
  }

  const handleTesting = async () => {
    if (checkParams()) {
      setIsLoading(true)
      const data = await getRepoInfo().finally(() => {
        setIsLoading(false)
        setSync({ ...sync, username: '', avatar: '', size: 0, visibility: '' })
      })
      setSync({
        ...sync,
        username: data.owner.login,
        avatar: data.owner.avatar_url,
        size: data.size,
        visibility: data.visibility
      })
    } else {
      openAlert(t`page.settings.data.alert.paramsNeeded`)
    }
  }

  const handleSyncing = async () => {
    if (checkParams()) {
      setIsLoading(true)
      syncToGithub()
        .then(() => {
          openAlert(t`page.settings.data.alert.syncSuccess`)
          setSync(useStore.getState().sync)
        })
        .catch((e) => logger.error(e))
        .finally(() => setIsLoading(false))
    } else {
      openAlert(t`page.settings.data.alert.paramsNeeded`)
    }
  }

  const dropdownOptions: { key: FetchMethods; text: string }[] = [
    { key: 'mixed', text: t`page.edit.dropdown.mixed` },
    { key: 'vndb', text: t`page.edit.dropdown.vndb` },
    { key: 'bgm', text: t`page.edit.dropdown.bgm` }
  ]

  const handleCleanCache = () => {
    useStore.setState((state) => ({
      ...state,
      cache: {}
    }))
  }

  return (
    <div className="overflow-auto px-4">
      <Stack
        horizontal
        verticalAlign="center"
        tokens={{ childrenGap: 12 }}
        className="p-4 border-2 border-solid border-gray-100 rounded-md"
      >
        <img
          src={sync.avatar || 'https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y'}
          alt="User Avatar"
          className="w-16 h-16 rounded-full object-cover"
        />
        <Stack tokens={{ childrenGap: 4 }} verticalAlign="center">
          <Text variant="large" className="font-semibold text-gray-800">
            {sync.username || t`page.settings.profile.notLogged`}
          </Text>
          <Text variant="small" className="text-gray-500">
            {t`page.settings.profile.lastSync`}
            {sync.time ? new Date(sync.time).toLocaleString() : t`page.settings.profile.notSynced`}
          </Text>
          <Stack horizontal tokens={{ childrenGap: 4 }}>
            <Text variant="small" className="text-gray-500">
              {t`page.settings.profile.repoSize`}
              {sync.size ? (sync.size / 1024).toFixed(2) : 0} MB
            </Text>
            <Text variant="small" className="text-gray-500">
              {t`page.settings.profile.visibility`}
              <span
                className={`${
                  sync.visibility === 'public'
                    ? 'text-green-500'
                    : sync.visibility === 'private'
                      ? 'text-red-500'
                      : 'text-yellow-500'
                }`}
              >
                {sync.visibility === 'public'
                  ? t`page.settings.profile.visibility.public`
                  : sync.visibility === 'private'
                    ? t`page.settings.profile.visibility.private`
                    : t`page.settings.profile.visibility.unknown`}
              </span>
            </Text>
          </Stack>
        </Stack>
      </Stack>

      <Stack tokens={{ childrenGap: 8 }}>
        <Stack tokens={{ childrenGap: 4 }}>
          <Stack horizontal tokens={{ childrenGap: 16 }} verticalAlign="center">
            <h2 className="text-lg font-semibold">{t`page.settings.data.title`}</h2>
          </Stack>

          <Stack horizontal tokens={{ childrenGap: 16 }} verticalAlign="center">
            <h3 className="font-semibold w-12">{t`page.settings.data.token`}</h3>
            <TextField
              className="flex-grow-1"
              value={settings.githubToken ?? ''}
              type="password"
              onChange={(_, v) => setSettings((state) => ({ ...state, githubToken: v ?? '' }))}
              autoComplete="off"
            />
            <span
              className="text-xs text-blue-400 hover:cursor-pointer"
              onClick={() => openUrl('https://github.com/settings/tokens')}
            >
              {t`page.settings.data.token.get`}
            </span>
          </Stack>

          <Stack horizontal tokens={{ childrenGap: 16 }} verticalAlign="center">
            <h3 className="font-semibold w-9">{t`page.settings.data.repo`}</h3>
            <TextField
              className="flex-grow-1"
              placeholder={t`page.settings.data.repo.placeholder`}
              value={settings.githubRepo ?? ''}
              onChange={(_, v) => setSettings((state) => ({ ...state, githubRepo: v ?? '' }))}
              autoComplete="off"
            />
          </Stack>

          <Stack horizontal tokens={{ childrenGap: 16 }} verticalAlign="center">
            <h3 className="font-semibold w-9">{t`page.settings.data.path`}</h3>
            <TextField
              className="flex-grow-1"
              placeholder={t`page.settings.data.path.placeholder`}
              value={settings.githubPath ?? ''}
              onChange={(_, v) => setSettings((state) => ({ ...state, githubPath: v ?? '' }))}
              autoComplete="off"
            />
          </Stack>

          <Stack horizontal tokens={{ childrenGap: 16 }} verticalAlign="center">
            <h3 className="font-semibold w-25">{t`page.settings.data.autoSync`}</h3>
            <TextField
              type="number"
              value={settings.autoSyncMinutes.toString()}
              onChange={(_, value) =>
                setSettings((state) => ({ ...state, autoSyncMinutes: value ? Number.parseInt(value) : 0 }))
              }
              className="flex-grow-1"
              autoComplete="off"
            />
            <span className="text-xs">{t`page.settings.data.autoSync.unit`}</span>
          </Stack>

          <Stack horizontal tokens={{ childrenGap: 16 }} verticalAlign="center">
            <h3 className="font-semibold w-29">{t`page.settings.data.source`}</h3>
            <Dropdown
              options={dropdownOptions}
              selectedKey={settings.fetchMethods}
              className="w-30"
              onChange={(_, option) =>
                setSettings((state) => ({
                  ...state,
                  fetchMethods: (option?.key as FetchMethods) ?? DEFAULT_STATE.settings.fetchMethods
                }))
              }
            />
          </Stack>

          <Stack horizontal tokens={{ childrenGap: 16 }} verticalAlign="center">
            <DefaultButton text={t`page.settings.data.button.export`} onClick={handleExport} />
            <DefaultButton text={t`page.settings.data.button.import`} onClick={handleImport} />
            <DefaultButton text={t`page.settings.data.button.test`} onClick={handleTesting} />
            <DefaultButton text={t`page.settings.data.button.sync`} onClick={handleSyncing} />
            {isLoading && <Spinner />}
          </Stack>
        </Stack>
        <Separator />

        <Stack tokens={{ childrenGap: 4 }}>
          <h2 className="text-lg font-semibold">{t`page.settings.appearance.title`}</h2>

          {/* TODO: Implement theme */}
          {/* <div>
            <h3 className="font-semibold w-12">{t`page.settings.appearance.theme`}</h3>
            <ChoiceGroup
              options={[
                { key: 'light', text: t`page.settings.appearance.theme.light` },
                { key: 'dark', text: t`page.settings.appearance.theme.dark` },
                { key: 'system', text: t`page.settings.appearance.theme.system` }
              ]}
              selectedKey={settings.theme}
              onChange={(_, option) => setSettings({ theme: option?.key as RootState['settings']['theme'] })}
            />
          </div> */}

          <div>
            <h3 className="text-lg font-semibold">{t`page.settings.appearance.language`}</h3>
            <ChoiceGroup
              options={[
                { key: 'en_US', text: t`page.settings.appearance.language.en` },
                { key: 'zh_CN', text: t`page.settings.appearance.language.zh` },
                { key: 'ja_JP', text: t`page.settings.appearance.language.ja` },
                { key: 'zh_TW', text: t`page.settings.appearance.language.zhTw` }
              ]}
              selectedKey={settings.language}
              onChange={(_, option) =>
                setSettings((state) => ({ ...state, language: option?.key as RootState['settings']['language'] }))
              }
            />
          </div>
        </Stack>
        <Separator />

        <Stack tokens={{ childrenGap: 4 }}>
          <h2 className="text-lg font-semibold">{t`page.settings.detail.title`}</h2>
          <TextField
            label={t`page.settings.detail.maxTimelineDisplayCount`}
            className="w-35"
            value={settings.maxTimelineDisplayCount.toString()}
            type="number"
            onChange={(_, v) =>
              setSettings((state) => ({
                ...state,
                maxTimelineDisplayCount: v ? Number.parseInt(v) : DEFAULT_STATE.settings.maxTimelineDisplayCount
              }))
            }
            autoComplete="off"
          />
          <Toggle
            label={t`page.settings.detail.playLaunchVoice`}
            checked={settings.playLaunchVoice}
            onChange={(_, checked) => setSettings((state) => ({ ...state, playLaunchVoice: !!checked }))}
          />
          <Toggle
            label={t`page.settings.detail.autoSetTitle`}
            checked={settings.autoSetGameTitle}
            onChange={(_, checked) => setSettings((state) => ({ ...state, autoSetGameTitle: !!checked }))}
          />
          {IS_TAURI && (
            <React.Fragment>
              <Toggle
                label={t`page.settings.detail.autoCacheCover`}
                checked={settings.autoCacheImage}
                onChange={(_, checked) => setSettings((state) => ({ ...state, autoCacheImage: !!checked }))}
              />
              <Stack horizontal tokens={{ childrenGap: 16 }} verticalAlign="center">
                <DefaultButton text={t`page.settings.details.button.cleanCache`} onClick={handleCleanCache} />
                {isLoading && <Spinner />}
              </Stack>
            </React.Fragment>
          )}
        </Stack>
        <Separator />
        <PrimaryButton text={t`page.settings.button.save`} onClick={() => updateSettings(settings)} />
      </Stack>
    </div>
  )
}

export default Settings
