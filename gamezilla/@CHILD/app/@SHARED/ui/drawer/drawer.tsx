import { VDom } from "../utils";
import "./drawer-element";
import { DrawerProps, drawerSub } from "./drawer-shared";

export const Drawer = ({
  id,
  open,
  onClose,
  children,
  position,
}: DrawerProps & {
  children?: VDom | VDom[];
}) => {
  drawerSub.publish({ type: "props", id, onClose, open, position });
  return (
    <drawer-element id={id} position={position}>
      <div class="w-full border border-neutral-700 bg-black">{children}</div>
    </drawer-element>
  );
};
