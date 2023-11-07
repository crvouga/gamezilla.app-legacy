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
    <bottom-drawer id={id}>
      <div className="w-full border border-neutral-700 bg-black">
        {children}
      </div>
    </bottom-drawer>
  );
};
