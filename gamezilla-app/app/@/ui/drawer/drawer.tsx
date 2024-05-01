import type { VDom, VDomChildren } from "gamezilla-app/@/vdom";
import { VDOM_IMPL } from "gamezilla-app/public-config";
import type { PrivateDrawerProps } from "./drawer-shared";
import { DrawerWebComponent } from "./drawer-web-component";

export type DrawerProps = PrivateDrawerProps & {
	children?: VDomChildren;
};

export const Drawer = (props: DrawerProps): VDom => {
	switch (VDOM_IMPL) {
		default: {
			return <DrawerWebComponent {...props} />;
		}
	}
};
