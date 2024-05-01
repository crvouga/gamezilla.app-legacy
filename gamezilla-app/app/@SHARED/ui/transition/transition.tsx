import type { VDomChildren } from "gamezilla-app/@shared/vdom";
import "./transition-element";
import { type TransitionProps, transitionSub } from "./transition-shared";

export const Transition = ({
	id,
	onEnter,
	onExit,
	children,
	className,
	mode,
}: TransitionProps & {
	children?: VDomChildren;
}) => {
	transitionSub.publish({
		type: "props",
		id,
		onEnter,
		onExit,
		className: className,
		mode,
	});
	// @ts-ignore
	return <transition-element id={id}>{children}</transition-element>;
};
