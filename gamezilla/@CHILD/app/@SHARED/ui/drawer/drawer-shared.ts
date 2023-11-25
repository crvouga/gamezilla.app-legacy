import { PubSub } from "gamezilla/@SHARED/core";

export type DrawerProps = {
  id: string;
  onClose: () => void;
  open: boolean;
  position: "bottom" | "top";
};

export type DrawerEvent = DrawerProps & {
  type: "props";
};

export const drawerSub = PubSub.create<DrawerEvent>();
