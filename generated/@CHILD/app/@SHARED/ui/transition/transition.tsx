import { VDomChildren } from "gamezilla-app/@SHARED/vdom";
import "./transition-element";
import { TransitionProps, transitionSub } from "./transition-shared";
export const Transition = ({ id, onEnter, onExit, children, className: className, mode, }: TransitionProps & {
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
