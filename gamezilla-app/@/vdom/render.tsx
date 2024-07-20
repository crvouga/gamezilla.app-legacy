import type { VDom } from "./vdom";
import type { VDomImpl } from "./vdom-impl";

export type CreatePortal = (vDom: VDom, container: Element) => VDom;

export let createPortal: CreatePortal | null = null;

export type Render = (vDom: VDom) => void;

export const Render = async (
	vDomImpl: VDomImpl,
	root: HTMLElement,
): Promise<Render> => {
	switch (vDomImpl) {
		case "inferno": {
			const Inferno = await import("inferno");
			createPortal = Inferno.createPortal;
			return (vDom) => {
				Inferno.render(vDom, root);
			};
		}

		case "react-with-compiler":
		case "react": {
			const [ReactDOMClient, ReactDOM, React] = await Promise.all([
				import("react-dom/client"),
				import("react-dom"),
				import("react"),
			]);
			const reactRoot = ReactDOMClient.createRoot(root);
			createPortal = ReactDOM.createPortal;
			return (vDom) => {
				// @ts-ignore
				reactRoot.render(<React.StrictMode>{vDom}</React.StrictMode>);
			};
		}

		case "preact": {
			const [Preact, PreactCompat] = await Promise.all([
				import("preact"),
				import("preact/compat"),
			]);
			createPortal = PreactCompat.createPortal;
			return (vDom) => {
				Preact.render(vDom, root);
			};
		}

		case "solid": {
			const Solid = await import("solid-js/web");
			let dispose: () => void;

			return (vDom) => {
				if (dispose) {
					dispose();
				}
				dispose = Solid.render(() => vDom, root);
			};
		}

		case "vue": {
			const Vue = await import("vue");
			// createPortal = Vue
			const vDomRef = Vue.ref(null);
			const app = Vue.createApp({
				render() {
					return vDomRef.value;
				},
			});
			app.mount(root);
			return (vDom) => {
				vDomRef.value = transformClassName(vDom);
				console.log(vDomRef.value);
			};
		}
	}
};

// @ts-ignore
const transformClassName = (vDom) => {
	if (Array.isArray(vDom)) {
		return vDom.map(transformClassName);
	} else if (vDom && typeof vDom === "object") {
		const { className, ...restinput } = vDom.input || {};
		const newinput = className ? { class: className, ...restinput } : restinput;
		// @ts-ignore
		const children = vDom.children
			? transformClassName(vDom.children)
			: vDom.children;

		return {
			...vDom,
			input: newinput,
			children: children,
		};
	}
	return vDom;
};
