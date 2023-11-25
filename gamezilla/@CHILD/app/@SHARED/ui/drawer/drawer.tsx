import { VDom } from "../utils";
import "./drawer-element";
import { DrawerProps, drawerSub } from "./drawer-shared";

export const Drawer = ({
  id,
  open,
  onClose,
  children,
}: DrawerProps & {
  children?: VDom | VDom[];
}) => {
  drawerSub.publish({ type: "props", id, onClose, open });
  return (
    <drawer-element id={id}>
      <div class="w-full border border-neutral-700 bg-black">{children}</div>
    </drawer-element>
  );
};
