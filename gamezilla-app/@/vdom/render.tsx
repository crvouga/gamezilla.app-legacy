import type { VDom } from "./vdom";
import type { VDomImpl } from "./vdom-impl";

export type Render = (vDom: VDom) => void;

export type CreatePortal = (vDom: VDom, container: Element) => VDom;

export let createPortal: CreatePortal | null = null;

export type RenderToString = (vDom: VDom) => string;

export const RenderToString = async (): Promise<RenderToString> => {
	const ReactDOMServer = await import("react-dom/server");
	return (vDom) => {
		const html = ReactDOMServer.renderToString(vDom);
		return html;
	};
};

type RenderToNode = (vDom: VDom) => HTMLElement;

export const RenderToNode = async (): Promise<RenderToNode> => {
	const renderToString = await RenderToString();
	const node = document.createElement("div");
	return (vDom) => {
		const html = renderToString(vDom);
		node.innerHTML = html;
		return node;
	};
};

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

		case "react": {
			const [ReactDOMClient, ReactDOM, React] = await Promise.all([
				import("react-dom/client"),
				import("react-dom"),
				import("react"),
			]);
			const reactRoot = ReactDOMClient.createRoot(root);
			createPortal = ReactDOM.createPortal;
			return (vDom) => {
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
	}
};
