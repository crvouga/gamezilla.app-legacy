import { VDom } from "../ui";
import "./transition-element";
import { TransitionProps, transitionSub } from "./transition-shared";

export const Transition = ({
  id,
  onEnter,
  onExit,
  children,
  className: className,
  mode,
}: TransitionProps & {
  children?: VDom | VDom[];
}) => {
  transitionSub.publish({
    type: "props",
    id,
    onEnter,
    onExit,
    className: className,
    mode,
  });
  return <transition-element id={id}>{children}</transition-element>;
};
