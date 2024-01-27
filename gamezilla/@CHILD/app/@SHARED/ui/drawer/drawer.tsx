import { IconButton, IconXMark } from "..";
import { VDom } from "../ui";
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
      <div className="w-full border border-neutral-600 bg-black">
        {children}
      </div>
    </drawer-element>
  );
};

export const DrawerHeader = ({ onClose }: { onClose?: () => void }) => {
  return (
    <div className="flex w-full items-center justify-end">
      <IconButton label="close drawer" onClick={onClose}>
        <IconXMark className="h-6 w-6" />
      </IconButton>
    </div>
  );
};
