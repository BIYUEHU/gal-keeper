import { getRepoInfo, syncToGithub } from '@/api/github'
import { IS_TAURI } from '@/constant'
import { useUI } from '@/contexts/UIContext'
import useStore from '@/store'
import type { RootState } from '@/store'
import { openUrl } from '@/utils'
import { f, t } from '@/utils/i18n'
import { Stack, TextField, ChoiceGroup, Toggle, Separator, DefaultButton, Text } from '@fluentui/react'
import { Spinner } from '@fluentui/react-components'
import React, { useState } from 'react'

export const Settings: React.FC = () => {
  const { settings, updateSettings } = useStore((state) => state)
  const [sync, setSync] = useState(useStore((state) => state.sync))
  const { openAlert } = useUI()
  const [isLoading, setIsLoading] = useState(false)

  const checkParams = () => settings.githubToken && settings.githubRepo && settings.githubPath

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
      openAlert(t`page.settings.github.alert.paramsNeeded`)
    }
  }
  const handleSyncing = async () => {
    if (checkParams()) {
      setIsLoading(true)
      // const { time, add, remove } = await syncToGithub().finally(() => setIsLoading(false))
      // openAlert(f`page.settings.github.alert.syncSuccess`(add.toString(), remove.toString()))
      // setSync({ ...sync, time })
    } else {
      openAlert(t`page.settings.github.alert.paramsNeeded`)
    }
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
            <h2 className="text-lg font-semibold">{t`page.settings.github.title`}</h2>
          </Stack>

          <Stack horizontal tokens={{ childrenGap: 16 }} verticalAlign="center">
            <h3 className="font-semibold w-12">{t`page.settings.github.token`}</h3>
            <TextField
              className="flex-grow-1"
              value={settings.githubToken ?? ''}
              type="password"
              onChange={(_, v) => updateSettings({ githubToken: v ?? '' })}
              autoComplete="off"
            />
            <span
              className="text-xs text-blue-400 hover:cursor-pointer"
              onClick={() => openUrl('https://github.com/settings/tokens')}
            >
              {t`page.settings.github.token.get`}
            </span>
          </Stack>

          <Stack horizontal tokens={{ childrenGap: 16 }} verticalAlign="center">
            <h3 className="font-semibold w-9">{t`page.settings.github.repo`}</h3>
            <TextField
              className="flex-grow-1"
              placeholder={t`page.settings.github.repo.placeholder`}
              value={settings.githubRepo ?? ''}
              onChange={(_, v) => updateSettings({ githubRepo: v ?? '' })}
              autoComplete="off"
            />
          </Stack>

          <Stack horizontal tokens={{ childrenGap: 16 }} verticalAlign="center">
            <h3 className="font-semibold w-9">{t`page.settings.github.path`}</h3>
            <TextField
              className="flex-grow-1"
              placeholder={t`page.settings.github.path.placeholder`}
              value={settings.githubPath ?? ''}
              onChange={(_, v) => updateSettings({ githubPath: v ?? '' })}
              autoComplete="off"
            />
          </Stack>

          <Stack horizontal tokens={{ childrenGap: 16 }} verticalAlign="center">
            <h3 className="font-semibold w-25">{t`page.settings.github.autoSync`}</h3>
            <TextField
              type="number"
              value={settings.autoSyncMinutes.toString()}
              onChange={(_, value) => updateSettings({ autoSyncMinutes: Number(value) })}
              className="flex-grow-1"
              autoComplete="off"
            />
            <span className="text-xs">{t`page.settings.github.autoSync.unit`}</span>
          </Stack>

          <Stack horizontal tokens={{ childrenGap: 16 }} verticalAlign="center">
            <DefaultButton text={t`page.settings.github.button.test`} onClick={handleTesting} />
            <DefaultButton text={t`page.settings.github.button.sync`} onClick={handleSyncing} />
            {isLoading && <Spinner />}
          </Stack>
        </Stack>
        <Separator />

        <Stack tokens={{ childrenGap: 4 }}>
          <h2 className="text-lg font-semibold">{t`page.settings.appearance.title`}</h2>

          <div>
            <h3 className="font-semibold w-12">{t`page.settings.appearance.theme`}</h3>
            <ChoiceGroup
              options={[
                { key: 'light', text: t`page.settings.appearance.theme.light` },
                { key: 'dark', text: t`page.settings.appearance.theme.dark` },
                { key: 'system', text: t`page.settings.appearance.theme.system` }
              ]}
              selectedKey={settings.theme}
              onChange={(_, option) => updateSettings({ theme: option?.key as RootState['settings']['theme'] })}
            />
          </div>

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
                updateSettings({ language: option?.key as 'en_US' | 'zh_CN' | 'ja_JP' | 'zh_TW' })
              }
            />
          </div>
        </Stack>
        <Separator />

        <Stack tokens={{ childrenGap: 4 }}>
          <h2 className="text-lg font-semibold">{t`page.settings.detail.title`}</h2>
          <Toggle
            label={t`page.settings.detail.autoSetTitle`}
            checked={settings.autoSetGameTitle}
            onChange={(_, checked) => updateSettings({ autoSetGameTitle: checked })}
          />
          {IS_TAURI && (
            <React.Fragment>
              <Toggle
                label={t`page.settings.detail.autoCacheCover`}
                checked={settings.autoCacheGameCover}
                onChange={(_, checked) => updateSettings({ autoCacheGameCover: checked })}
              />
              <Toggle
                label={t`page.settings.detail.onlyRecordActive`}
                checked={settings.onlyRecordActiveTime}
                onChange={(_, checked) => updateSettings({ onlyRecordActiveTime: checked })}
              />
            </React.Fragment>
          )}
        </Stack>
      </Stack>
    </div>
  )
}
