import { createPortal, type VDomChildren } from "gamezilla-app/@shared/vdom";

const getExit = (portalId: string): HTMLElement | null => {
	if (typeof document === "undefined") {
		return null;
	}
	return (document.querySelector(
		`[data-portal-exit][data-portal-id="${portalId}"]`,
	) ?? null) as HTMLElement | null;
};

const Entrance = (props: { portalId: string; children: VDomChildren }) => {
	const element = getExit(props.portalId);
	if (!element) {
		return null;
	}
	return (
		<div data-portal-entrance data-portal-id={props.portalId}>
			{createPortal?.(props.children, element)}
		</div>
	);
};

const Exit = (props: { portalId: string }) => {
	return (
		<div
			id={props.portalId}
			data-portal-exit
			data-portal-id={props.portalId}
		></div>
	);
};

export const Portal = {
	getExit,
	Entrance,
	Exit,
};
