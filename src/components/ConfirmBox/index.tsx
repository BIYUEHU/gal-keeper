import { t } from '@/utils/i18n'
import { Dialog, DialogType, DialogFooter, PrimaryButton, DefaultButton } from '@fluentui/react'

interface ConfirmBoxProps {
  title?: string
  text?: string
  isOpen: boolean
  setIsOpen: (isOpen: boolean) => void
  onConfirm?: () => void
}

const ConfirmBox: React.FC<ConfirmBoxProps> = ({ title = '', text = '', isOpen, setIsOpen, onConfirm }) => {
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
          title: title || t`component.confirmBox.default.title`,
          subText: text
        }}
      >
        <DialogFooter>
          <DefaultButton text={t`component.confirmBox.button.cancel`} onClick={handleCancel} />
          <PrimaryButton text={t`component.confirmBox.button.confirm`} onClick={handleConfirm} />
        </DialogFooter>
      </Dialog>
    </>
  )
}

export default ConfirmBox
