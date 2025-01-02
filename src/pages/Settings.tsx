import type { AppState } from '@/store'
import useStore from '@/store'
import { Stack, TextField, ChoiceGroup, Toggle, Separator } from '@fluentui/react'

export const Settings: React.FC = () => {
  const { settings, updateSettings } = useStore((state) => state)

  return (
    <div className="overflow-auto px-4 children:children:children:my-1">
      <Stack tokens={{ childrenGap: 24 }}>
        <h2 className="text-lg font-semibold ">Github Api 设置</h2>
        <Stack tokens={{ childrenGap: 16 }}>
          <Stack horizontal tokens={{ childrenGap: 16 }} verticalAlign="center">
            <h3 className="font-semibold w-12">Token</h3>
            <TextField
              className="flex-grow-1"
              value={settings.githubToken ?? ''}
              type="password"
              onChange={(_, v) => updateSettings({ githubToken: v ?? '' })}
            />
          </Stack>
          <Stack horizontal tokens={{ childrenGap: 16 }} verticalAlign="center">
            <h3 className="font-semibold w-13">用户名</h3>
            <TextField
              className="flex-grow-1"
              value={settings.githubUsername ?? ''}
              onChange={(_, v) => updateSettings({ githubUsername: v ?? '' })}
            />
          </Stack>
          <Stack horizontal tokens={{ childrenGap: 16 }} verticalAlign="center">
            <h3 className="font-semibold w-9">仓库</h3>
            <TextField
              className="flex-grow-1"
              value={settings.githubRepo ?? ''}
              onChange={(_, v) => updateSettings({ githubRepo: v ?? '' })}
            />
          </Stack>
          <Stack horizontal tokens={{ childrenGap: 16 }} verticalAlign="center">
            <h3 className="font-semibold w-9">分支</h3>
            <TextField
              className="flex-grow-1"
              value={settings.githubBranch ?? ''}
              onChange={(_, v) => updateSettings({ githubBranch: v ?? '' })}
            />
          </Stack>
        </Stack>
        <Separator />

        <h2 className="text-lg font-semibold">外观</h2>
        <Stack tokens={{ childrenGap: 12 }}>
          <ChoiceGroup
            label="主题"
            options={[
              { key: 'light', text: '浅色' },
              { key: 'dark', text: '深色' },
              { key: 'system', text: '跟随系统' }
            ]}
            selectedKey={settings.theme}
            onChange={(_, option) => updateSettings({ theme: option?.key as AppState['settings']['theme'] })}
          />
        </Stack>

        <h2 className="text-lg font-semibold mb-4">语言</h2>
        <Stack tokens={{ childrenGap: 12 }}>
          <ChoiceGroup
            label="语言"
            options={[
              { key: 'en_US', text: '英语' },
              { key: 'zh_CN', text: '简体中文' },
              { key: 'ja_JP', text: '日语' },
              { key: 'zh_TW', text: '繁体中文' }
            ]}
            selectedKey={settings.language}
            onChange={(_, option) => updateSettings({ language: option?.key as 'en_US' | 'zh_CN' | 'ja_JP' | 'zh_TW' })}
          />
        </Stack>

        <h2 className="text-lg font-semibold mb-4">游戏设置</h2>
        <Stack tokens={{ childrenGap: 12 }}>
          <Toggle
            label="游戏启动时最小化启动器"
            checked={settings.onlyRecordActiveTime}
            onChange={(_, checked) => updateSettings({ onlyRecordActiveTime: checked })}
          />
          <Toggle
            label="自动同步游戏时长"
            checked={settings.autoSetGameTitle}
            onChange={(_, checked) => updateSettings({ autoSetGameTitle: checked })}
          />
          <Toggle
            label="自动缓存游戏封面"
            checked={settings.autoCacheGameCover}
            onChange={(_, checked) => updateSettings({ autoCacheGameCover: checked })}
          />
        </Stack>
      </Stack>
    </div>
  )
}
