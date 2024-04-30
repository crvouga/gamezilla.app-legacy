import { IconButton } from "../icon-button"
import { IconXMark } from "../icon/icon-x-mark"

export const DrawerHeader = (props: { onClose?: () => void }) => {
  return (
    <div className="flex w-full items-center justify-end">
      <IconButton label="close drawer" onClick={props.onClose}>
        <IconXMark className="h-6 w-6" />
      </IconButton>
    </div>
  )
}
