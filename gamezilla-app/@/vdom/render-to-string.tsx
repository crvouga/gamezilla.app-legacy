import type {VDom} from './vdom';

export type CreatePortal = (vDom: VDom, container: Element) => VDom;

export let createPortal: CreatePortal | null = null;

export type RenderToString = (vDom: VDom) => string;

export const RenderToString = async (): Promise<RenderToString> => {
	const ReactDOMServer = await import('react-dom/server');
	return (vDom) => {
		const html =
			ReactDOMServer.renderToString(
				vDom,
			);
		return html;
	};
};

type RenderToNode = (vDom: VDom) => HTMLElement;

export const RenderToNode = async (): Promise<RenderToNode> => {
	const ReactDOM = await import('react-dom/client');
	const React = await import('react');
	return (vDom) => {
		const root = document.createElement('div');
		const reactRoot = ReactDOM.createRoot(root);
		reactRoot.render(
			<React.StrictMode>
				{vDom}
			</React.StrictMode>,
		);
		return root;
	};
};
