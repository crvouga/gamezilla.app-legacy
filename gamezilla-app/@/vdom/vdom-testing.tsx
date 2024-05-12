import { expect } from "bun:test";

export const getByText = (
	node: HTMLElement,
	text: string,
): HTMLElement | null => {
	const elements: HTMLElement[] = [];

	const searchNode = (currentNode: HTMLElement) => {
		if (currentNode.textContent?.includes(text)) {
			elements.push(currentNode);
		}
		for (let i = 0; i < currentNode.children.length; i++) {
			searchNode(currentNode.children[i] as HTMLElement);
		}
	};

	searchNode(node);
	const element = elements[0] ?? null;
	return element;
};

export const expectByText = (node: HTMLElement, text: string) => {
	const element = getByText(node, text);
	if (!element) {
		throw new Error(`Element with text "${text}" not found`);
	}
	expect(element.innerHTML.includes(text)).toBe(true);
};