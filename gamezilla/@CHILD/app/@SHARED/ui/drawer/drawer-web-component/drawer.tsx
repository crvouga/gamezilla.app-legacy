import { Portal } from "../.."
import { cn } from "../../ui"
import { DrawerProps } from "../drawer-shared"
import "./drawer-element"
import { drawerSub } from "./drawer-shared"

export const DrawerWebComponent = ({
  id,
  open,
  onClose,
  children,
  position,
}: DrawerProps) => {
  drawerSub.publish({ type: "props", id, onClose, open, position })
  return (
    <Portal.Entrance portalId="modals">
      <drawer-element id={id} position={position}>
        <div
          className={cn(
            "h-fit max-h-full w-full overflow-hidden border border-neutral-600 bg-black",
            position === "bottom" ? "rounded-t-2xl" : "rounded-b-2xl",
          )}
        >
          {children}
        </div>
      </drawer-element>
    </Portal.Entrance>
  )
}
