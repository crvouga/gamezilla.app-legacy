import { render, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { VDom } from "../vdom";
import { AriaRole } from "./aria-role";
import { ITestRender, TestNode } from "./test-render";

export const TestRenderReact: ITestRender = (vdom: VDom): TestNode => {
	const rendered = render(vdom);

	const createTestNode = (baseElement: VDom): TestNode => {
		return {
			hasText(text: string): boolean {
				try {
					return within(baseElement).getByText(text) !== null;
				} catch {
					return false;
				}
			},
			click(): void {
				userEvent.click(baseElement);
			},
			getByRole(role: AriaRole): TestNode {
				try {
					const element = within(baseElement).getByRole(role);
					return createTestNode(element);
				} catch {
					throw new Error(`No element with role ${role}`);
				}
			},
			getByText(text: string): TestNode {
				try {
					const element = within(baseElement).getByText(text);
					return createTestNode(element);
				} catch {
					throw new Error(`No element with text ${text}`);
				}
			},
		};
	};

	return createTestNode(rendered.container);
};
