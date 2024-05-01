import type { VDom, VDomChildren } from "gamezilla-app/@/vdom";
import type { PrivateDrawerProps } from "./drawer-shared";
import { DrawerWebComponent } from "./drawer-web-component";

export type DrawerProps = PrivateDrawerProps & {
  children?: VDomChildren;
};

export const Drawer = (props: DrawerProps): VDom => {
  return <DrawerWebComponent {...props} />;
};
