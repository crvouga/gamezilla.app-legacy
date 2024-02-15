import { IconButton, IconXMark } from ".."

export const DrawerHeader = ({ onClose }: { onClose?: () => void }) => {
  return (
    <div className="flex w-full items-center justify-end">
      <IconButton label="close drawer" onClick={onClose}>
        <IconXMark className="h-6 w-6" />
      </IconButton>
    </div>
  )
}
