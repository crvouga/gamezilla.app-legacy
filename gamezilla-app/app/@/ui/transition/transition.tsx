import type { VDomChildren } from "gamezilla-app/@/vdom";
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
	transitionSub.pub({
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
