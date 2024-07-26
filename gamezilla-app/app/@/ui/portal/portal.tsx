import {createPortal, type VDomChildren} from 'gamezilla-app/@/vdom';

const getExit = (portalId: string): HTMLElement | null => {
	if (typeof document === 'undefined') {
		return null;
	}
	return (document.querySelector(
		`[data-portal-exit][data-portal-id="${portalId}"]`,
	) ?? null) as HTMLElement | null;
};

const Entrance = (input: {portalId: string; children: VDomChildren}) => {
	const element = getExit(input.portalId);
	if (!element) {
		return input.children;
	}
	return (
		<div
			data-portal-entrance
			data-portal-id={input.portalId}
		>
			{createPortal?.(
				input.children,
				element,
			)}
		</div>
	);
};

const Exit = (input: {portalId: string}) => {
	return (
		<div
			id={input.portalId}
			data-portal-exit
			data-portal-id={input.portalId}
		/>
	);
};

export const Portal = {
	getExit,
	Entrance,
	Exit,
};
