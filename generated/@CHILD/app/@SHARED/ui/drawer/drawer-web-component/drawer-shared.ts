import { PubSub } from "gamezilla-app/@SHARED/core";
import { PrivateDrawerProps } from "../drawer-shared";
export type DrawerEvent = PrivateDrawerProps & {
    type: "props";
};
export const drawerSub = PubSub.create<DrawerEvent>();
