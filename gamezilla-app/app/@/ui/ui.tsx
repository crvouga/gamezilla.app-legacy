export const cn = (
	...classes: (string | boolean | number | undefined | null)[]
) => {
	return classes.filter(Boolean).join(" ");
};

declare global {
	interface Window {
		/**
		 * This is how we're passing callbacks to custom elements.
		 * Since we can't pass functions as props to custom elements,
		 */
		customElementsCallbacks: Map<string, Function>;
	}
}

if (typeof window !== "undefined" && "customElements" in window) {
	window.customElementsCallbacks = new Map();
}
