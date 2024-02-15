import { VDomChildren } from "gamezilla/@SHARED/vdom"
import { IconButton, IconXMark, Portal } from ".."
import { cn } from "../ui"
import "./drawer-element"
import { PrivateDrawerProps, drawerSub } from "./drawer-shared"

export type DrawerProps = PrivateDrawerProps & {
  children?: VDomChildren
}

export const Drawer = ({
  id,
  open,
  onClose,
  children,
  position,
}: DrawerProps) => {
  drawerSub.publish({ type: "props", id, onClose, open, position })
  return (
    <Portal.Entrance portalId="modals">
      {/* @ts-ignore */}
      <drawer-element id={id} position={position}>
        <div
          className={cn(
            "w-full border border-neutral-600 bg-black",
            position === "bottom" ? "rounded-t-2xl" : "rounded-b-2xl",
          )}
        >
          {children}
        </div>
        {/* @ts-ignore */}
      </drawer-element>
    </Portal.Entrance>
  )
}

export const DrawerHeader = ({ onClose }: { onClose?: () => void }) => {
  return (
    <div className="flex w-full items-center justify-end">
      <IconButton label="close drawer" onClick={onClose}>
        <IconXMark className="h-6 w-6" />
      </IconButton>
    </div>
  )
}
