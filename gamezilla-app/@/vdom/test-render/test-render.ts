import type { VDom } from "../vdom";
import type { AriaRole } from "./aria-role";

export type TestNode = {
	click: () => void;
	getByRole: (ariaRole: AriaRole, ariaName?: string) => TestNode | null;
	getAttribute: (attribute: string) => string | null;
	disabled: boolean;
};

export type ITestRender = (vdom: VDom) => TestNode;
