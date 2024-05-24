import { expect } from "bun:test";
import { AriaRole } from "react";

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

    type AriaRole =
        | "alert"
        | "alertdialog"
        | "application"
        | "article"
        | "banner"
        | "button"
        | "cell"
        | "checkbox"
        | "columnheader"
        | "combobox"
        | "complementary"
        | "contentinfo"
        | "definition"
        | "dialog"
        | "directory"
        | "document"
        | "feed"
        | "figure"
        | "form"
        | "grid"
        | "gridcell"
        | "group"
        | "heading"
        | "img"
        | "link"
        | "list"
        | "listbox"
        | "listitem"
        | "log"
        | "main"
        | "marquee"
        | "math"
        | "menu"
        | "menubar"
        | "menuitem"
        | "menuitemcheckbox"
        | "menuitemradio"
        | "navigation"
        | "none"
        | "note"
        | "option"
        | "presentation"
        | "progressbar"
        | "radio"
        | "radiogroup"
        | "region"
        | "row"
        | "rowgroup"
        | "rowheader"
        | "scrollbar"
        | "search"
        | "searchbox"
        | "separator"
        | "slider"
        | "spinbutton"
        | "status"
        | "switch"
        | "tab"
        | "table"
        | "tablist"
        | "tabpanel"
        | "term"
        | "textbox"
        | "timer"
        | "toolbar"
        | "tooltip"
        | "tree"
        | "treegrid"
        | "treeitem"
        | (string & {});


export const getByRole = (
	node: HTMLElement,
	role: AriaRole,
): HTMLElement | null => {
	const elements: HTMLElement[] = [];

	const searchNode = (currentNode: HTMLElement) => {
		if (currentNode.getAttribute("role") === role) {
			elements.push(currentNode);
		}
		for (let i = 0; i < currentNode.children.length; i++) {
			searchNode(currentNode.children[i] as HTMLElement);
		}
	};
	searchNode(node);
	return elements[0] ?? null;
};
