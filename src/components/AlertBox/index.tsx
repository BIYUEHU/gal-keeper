import { useUI } from '@/contexts/UIContext'
import { t } from '@/utils/i18n'
import { Dialog, DialogFooter, PrimaryButton, DialogType } from '@fluentui/react'

export function AlertBox() {
  const {
    state: { alert },
    closeAlert
  } = useUI()

  return (
    <Dialog
      hidden={!alert.isOpen}
      onDismiss={closeAlert}
      dialogContentProps={{
        type: DialogType.normal,
        title: alert.title,
        subText: alert.text
      }}
    >
      <DialogFooter>
        <PrimaryButton text={t`component.alertBox.button.sure`} onClick={closeAlert} />
      </DialogFooter>
    </Dialog>
  )
}
