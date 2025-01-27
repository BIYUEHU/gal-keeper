import { useUI } from '@/contexts/UIContext'
import { t } from '@/utils/i18n'
import { Dialog, DialogFooter, PrimaryButton, DialogType, DefaultButton } from '@fluentui/react'

export function AlertBox() {
  const {
    state: { alert },
    closeAlert
  } = useUI()

  const copy = () => {
    const el = document.createElement('textarea')
    el.value = alert.text
    document.body.appendChild(el)
    el.select()
    document.execCommand('copy')
    document.body.removeChild(el)
  }

  return (
    <Dialog
      hidden={!alert.isOpen}
      onDismiss={closeAlert}
      dialogContentProps={{
        type: DialogType.normal,
        title: alert.title,
        subText: alert.text
      }}
      styles={{ main: { maxHeight: '80%' } }}
    >
      <DialogFooter>
        <DefaultButton
          hidden={t`alert.title` === alert.title}
          text={t`component.alertBox.button.copy`}
          onClick={copy}
        />
        <PrimaryButton text={t`component.alertBox.button.sure`} onClick={closeAlert} />
      </DialogFooter>
    </Dialog>
  )
}
