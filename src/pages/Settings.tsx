import { Stack, TextField, ChoiceGroup, Toggle, DefaultButton } from '@fluentui/react'

export const Settings: React.FC = () => {
  return (
    <div>
      <Stack tokens={{ childrenGap: 24 }}>
        <section>
          <h2 className="text-lg font-semibold mb-4">账户设置</h2>
          <Stack tokens={{ childrenGap: 12 }}>
            <TextField label="用户名" value="GoldenPotato" disabled />
            <TextField label="用户ID" value="485596" disabled />
            <DefaultButton text="退出登录" />
          </Stack>
        </section>

        <section>
          <h2 className="text-lg font-semibold mb-4">外观</h2>
          <Stack tokens={{ childrenGap: 12 }}>
            <ChoiceGroup
              label="主题"
              options={[
                { key: 'light', text: '浅色' },
                { key: 'dark', text: '深色' },
                { key: 'system', text: '跟随系统' }
              ]}
              defaultSelectedKey="light"
            />
          </Stack>
        </section>

        <section>
          <h2 className="text-lg font-semibold mb-4">游戏设置</h2>
          <Stack tokens={{ childrenGap: 12 }}>
            <Toggle label="游戏启动时最小化启动器" />
            <Toggle label="自动同步游戏时长" />
            <ChoiceGroup
              label="默认启动位置"
              options={[
                { key: 'local', text: '本地' },
                { key: 'cloud', text: '云端' }
              ]}
              defaultSelectedKey="local"
            />
          </Stack>
        </section>
      </Stack>
    </div>
  )
}
