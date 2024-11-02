import {
  Stack,
  TextField,
  DefaultButton,
  Panel
} from '@fluentui/react';

export const Settings: React.FC<{
  isOpen: boolean;
  onDismiss: () => void;
}> = ({ isOpen, onDismiss }) => {
  return (
    <Panel
      isOpen={isOpen}
      onDismiss={onDismiss}
      headerText="设置"
      closeButtonAriaLabel="关闭"
    >
      <Stack tokens={{ childrenGap: 16 }}>
        <TextField label="用户名" />
        <TextField label="用户ID" disabled />
        <DefaultButton text="退出登录" />
      </Stack>
    </Panel>
  );
};