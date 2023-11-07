import { Sub } from "gamezilla/@SHARED/core";

export type DrawerProps = {
  id: string;
  onClose: () => void;
  open: boolean;
};

export type DrawerEvent = DrawerProps & {
  type: "props";
};

export const drawerSub = Sub.create<DrawerEvent>();
