import useStore from '@/store'
import { t } from '@/utils/i18n'
import { Dialog, DialogType, DialogFooter, PrimaryButton } from '@fluentui/react'

export const AlertBox: React.FC = () => {
  const { alertIsOpen, alertText, alertTitle } = useStore((state) => state.temps)
  const closeAlert = useStore((state) => state.closeAlert)

  return (
    <>
      <Dialog
        hidden={!alertIsOpen}
        onDismiss={closeAlert}
        dialogContentProps={{
          type: DialogType.normal,
          title: alertTitle,
          subText: alertText
        }}
      >
        <DialogFooter>
          <PrimaryButton text={t`component.alertBox.button.sure`} onClick={closeAlert} />
        </DialogFooter>
      </Dialog>
    </>
  )
}
