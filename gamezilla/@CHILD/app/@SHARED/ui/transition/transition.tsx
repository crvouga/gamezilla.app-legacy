import { VDom } from "../utils";
import "./transition-element";
import { TransitionProps, transitionSub } from "./transition-shared";

export const Transition = ({
  id,
  onEnter,
  onExit,
  children,
  class: className,
  mode,
}: TransitionProps & {
  children?: VDom | VDom[];
  class: string;
}) => {
  transitionSub.publish({
    type: "props",
    id,
    onEnter,
    onExit,
    class: className,
    mode,
  });
  return <mount-transition id={id}>{children}</mount-transition>;
};
