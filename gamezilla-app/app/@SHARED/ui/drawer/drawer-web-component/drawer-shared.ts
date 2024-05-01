import { PubSub } from "gamezilla-app/@shared/core";
import type { PrivateDrawerProps } from "../drawer-shared";

export type DrawerEvent = PrivateDrawerProps & {
	type: "props";
};

export const drawerSub = PubSub.create<DrawerEvent>();
