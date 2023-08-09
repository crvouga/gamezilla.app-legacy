import { Sub } from "src/core";

export type DrawerProps = {
  id: string;
  onClose: () => void;
  open: boolean;
};

export type DrawerEvent = DrawerProps & {
  type: "props";
};

export const drawerSub = Sub.create<DrawerEvent>();
