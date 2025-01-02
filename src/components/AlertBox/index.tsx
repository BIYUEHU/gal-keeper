import useStore from '@/store'
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
          <PrimaryButton text="确认" onClick={closeAlert} />
        </DialogFooter>
      </Dialog>
    </>
  )
}
