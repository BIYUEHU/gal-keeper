import { Dialog, DialogType, DialogFooter, PrimaryButton, DefaultButton } from '@fluentui/react'

interface ConfirmBoxProps {
  title?: string
  text?: string
  isOpen: boolean
  setIsOpen: (isOpen: boolean) => void
  onConfirm?: () => void
}

export const ConfirmBox: React.FC<ConfirmBoxProps> = ({
  title = '提示',
  text = '',
  isOpen,
  setIsOpen,
  onConfirm
}) => {
  const handleConfirm = () => {
    setIsOpen(false)
    onConfirm?.()
  }

  const handleCancel = () => {
    setIsOpen(false)
  }

  return (
    <>
      <Dialog
        hidden={!isOpen}
        onDismiss={handleCancel}
        dialogContentProps={{
          type: DialogType.normal,
          title: title,
          subText: text
        }}
      >
        <DialogFooter>
          <PrimaryButton text="确认" onClick={handleConfirm} />
          <DefaultButton text="取消" onClick={handleCancel} />
        </DialogFooter>
      </Dialog>
    </>
  )
}
