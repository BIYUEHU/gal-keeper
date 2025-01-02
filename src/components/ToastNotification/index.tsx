import { useState } from 'react'
import { MessageBar, MessageBarType, Stack, PrimaryButton } from '@fluentui/react'

export const ToastNotification: React.FC = () => {
  const [visible, setVisible] = useState(false)

  return (
    <Stack tokens={{ childrenGap: 16 }}>
      <PrimaryButton text="触发消息提醒" onClick={() => setVisible(true)} />
      {visible && (
        <MessageBar messageBarType={MessageBarType.success} onDismiss={() => setVisible(false)} isMultiline={false}>
          操作已成功！
        </MessageBar>
      )}
    </Stack>
  )
}
