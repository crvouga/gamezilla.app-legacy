import { VDom } from "../vdom";
import { AriaRole } from "./aria-role";

export type TestNode = {
	hasText: (text: string) => boolean;
	click: () => void;
	getByRole: (role: AriaRole) => TestNode;
	getByText: (text: string) => TestNode;
};

export type ITestRender = (vdom: VDom) => TestNode;
