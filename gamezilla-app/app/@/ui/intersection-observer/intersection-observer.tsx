import type { VDomChildren } from "gamezilla-app/@/vdom";
import "./intersection-observer-element";
import {
	type IntersectionObserverEmitterProps,
	sub,
} from "./intersection-observer-shared";

export const IntersectionObserverEmitter = (
	props: IntersectionObserverEmitterProps & {
		children?: VDomChildren;
	},
) => {
	// There is some kind of race condition setTimeout fixes
	setTimeout(() => sub.pub({ type: "props", props }), 1);

	return <intersection-observer-dispatcher id={props.id} />;
};
