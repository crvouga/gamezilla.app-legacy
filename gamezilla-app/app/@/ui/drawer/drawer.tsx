import type {VDom, VDomChildren} from 'gamezilla-app/@/vdom';
import type {PrivateDrawerinput} from './drawer-shared';
import {DrawerWebComponent} from './drawer-web-component';

export type Drawerinput = PrivateDrawerinput & {
	children?: VDomChildren;
};

export const Drawer = (input: Drawerinput): VDom => {
	return <DrawerWebComponent {...input} />;
};
