import { VDom } from "gamezilla-app/@shared/vdom"
import { Button } from "./button"
import { cn } from "./ui"

export const ConfirmationDialog = ({
  open,
  onCancel,
  onClose,
  onConfirm,
  title,
  confirmTitle,
  cancelTitle = "Cancel",
}: {
  open: boolean
  onCancel: () => void
  onClose: () => void
  onConfirm: () => void
  title: string
  subtitle?: string
  confirmTitle: string
  cancelTitle?: string
  headerIcon?: VDom
}) => {
  return (
    <div
      className={cn(
        "absolute left-0 top-0 grid h-full w-full place-items-center",
        open ? "block" : "hidden",
      )}
      onClick={(msgEvt) => {
        if (msgEvt.target !== msgEvt.currentTarget) {
          return
        }
        onClose()
      }}
    >
      <div className="flex w-80 flex-col gap-6 rounded-lg bg-black p-6">
        <p className="text-center text-xl font-semibold">{title}</p>

        <div className="flex w-full items-center gap-4">
          <Button
            variant="outlined"
            onClick={(msgEvt) => {
              msgEvt.stopPropagation()
              onCancel()
            }}
            className="flex-1"
            text={cancelTitle}
          />

          <Button
            variant="contained"
            color="danger"
            onClick={(msgEvt) => {
              msgEvt.stopPropagation()
              onConfirm()
            }}
            className="flex-1"
            text={confirmTitle}
          />
        </div>
      </div>
    </div>
  )
}
