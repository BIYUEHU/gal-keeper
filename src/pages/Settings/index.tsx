import { getRepoInfo, syncToGithub } from '@/api/github'
import { IS_TAURI } from '@/constant'
import type { AppState } from '@/store'
import useStore from '@/store'
import { openUrl } from '@/utils'
import { Stack, TextField, ChoiceGroup, Toggle, Separator, DefaultButton, Text } from '@fluentui/react'
import { Spinner } from '@fluentui/react-components'
import React, { useState } from 'react'

export const Settings: React.FC = () => {
  const { settings, updateSettings } = useStore((state) => state)
  const [sync, setSync] = useState(useStore((state) => state.sync))

  const openAlert = useStore((state) => state.openAlert)
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
      openAlert('请先填写 Github Api Token、仓库名和路径！')
    }
  }
  const handleSyncing = async () => {
    if (checkParams()) {
      setIsLoading(true)
      const { time, add, remove } = await syncToGithub().finally(() => setIsLoading(false))
      openAlert(`同步成功，本地游戏新增 ${add} 个，删除 ${remove} 个`)
      setSync({ ...sync, time })
    } else {
      openAlert('请先填写 Github Api Token、仓库名和路径！')
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
            {sync.username || '未登录'}
          </Text>
          <Text variant="small" className="text-gray-500">
            上次同步时间：{sync.time ? new Date(sync.time).toLocaleString() : '未同步'}
          </Text>
          <Stack horizontal tokens={{ childrenGap: 4 }}>
            <Text variant="small" className="text-gray-500">
              仓库大小：{sync.size ? (sync.size / 1024).toFixed(2) : 0} MB
            </Text>
            <Text variant="small" className="text-gray-500">
              可见性：
              <span
                className={`${
                  sync.visibility === 'public'
                    ? 'text-green-500'
                    : sync.visibility === 'private'
                      ? 'text-red-500'
                      : 'text-yellow-500'
                }`}
              >
                {sync.visibility === 'public' ? '公开' : sync.visibility === 'private' ? '私有' : '不明'}
              </span>
            </Text>
          </Stack>
        </Stack>
      </Stack>

      <Stack tokens={{ childrenGap: 8 }}>
        <Stack tokens={{ childrenGap: 4 }}>
          <Stack horizontal tokens={{ childrenGap: 16 }} verticalAlign="center">
            <h2 className="text-lg font-semibold ">Github Api 设置</h2>
          </Stack>

          <Stack horizontal tokens={{ childrenGap: 16 }} verticalAlign="center">
            <h3 className="font-semibold w-12">Token</h3>
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
              获取 Github Api Token
            </span>
          </Stack>

          <Stack horizontal tokens={{ childrenGap: 16 }} verticalAlign="center">
            <h3 className="font-semibold w-9">仓库</h3>
            <TextField
              className="flex-grow-1"
              placeholder="诸如：biyuehu/galgame-data"
              value={settings.githubRepo ?? ''}
              onChange={(_, v) => updateSettings({ githubRepo: v ?? '' })}
              autoComplete="off"
            />
          </Stack>
          <Stack horizontal tokens={{ childrenGap: 16 }} verticalAlign="center">
            <h3 className="font-semibold w-9">路径</h3>
            <TextField
              className="flex-grow-1"
              placeholder="诸如：gal-keeper/"
              value={settings.githubPath ?? ''}
              onChange={(_, v) => updateSettings({ githubPath: v ?? '' })}
              autoComplete="off"
            />
          </Stack>

          <Stack horizontal tokens={{ childrenGap: 16 }} verticalAlign="center">
            <h3 className="font-semibold w-25">自动同步间隔</h3>
            <TextField
              type="number"
              value={settings.autoSyncMinutes.toString()}
              onChange={(_, value) => updateSettings({ autoSyncMinutes: Number(value) })}
              className="flex-grow-1"
              autoComplete="off"
            />
            <span className="text-xs">单位：分钟（0 表示不自动同步）</span>
          </Stack>

          <Stack horizontal tokens={{ childrenGap: 16 }} verticalAlign="center">
            <DefaultButton text="点击测试" onClick={handleTesting} />
            <DefaultButton text="手动同步" onClick={handleSyncing} />
            {isLoading && <Spinner />}
          </Stack>
        </Stack>
        <Separator />

        <Stack tokens={{ childrenGap: 4 }}>
          <h2 className="text-lg font-semibold">外观设置</h2>

          <div>
            <h3 className="font-semibold w-12">主题</h3>
            <ChoiceGroup
              options={[
                { key: 'light', text: '浅色' },
                { key: 'dark', text: '深色' },
                { key: 'system', text: '跟随系统' }
              ]}
              selectedKey={settings.theme}
              onChange={(_, option) => updateSettings({ theme: option?.key as AppState['settings']['theme'] })}
            />
          </div>

          <div>
            <h3 className="text-lg font-semibold">语言</h3>
            <ChoiceGroup
              options={[
                { key: 'en_US', text: '英语' },
                { key: 'zh_CN', text: '简体中文' },
                { key: 'ja_JP', text: '日语' },
                { key: 'zh_TW', text: '繁体中文' }
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
          <h2 className="text-lg font-semibold">细节设置</h2>
          <Toggle
            label="编辑游戏时自动设置游戏标题"
            checked={settings.autoSetGameTitle}
            onChange={(_, checked) => updateSettings({ autoSetGameTitle: checked })}
          />
          {IS_TAURI && (
            <React.Fragment>
              <Toggle
                label="编辑游戏时自动缓存游戏封面"
                checked={settings.autoCacheGameCover}
                onChange={(_, checked) => updateSettings({ autoCacheGameCover: checked })}
              />
              <Toggle
                label="仅在当前窗口为游戏窗口时记录时间"
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
