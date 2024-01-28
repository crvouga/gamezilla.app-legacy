import { VDom } from "../ui";
import "./intersection-observer-element";
import {
  IntersectionObserverEmitterProps,
  sub,
} from "./intersection-observer-shared";

export const IntersectionObserverEmitter = ({
  children,
  ...props
}: IntersectionObserverEmitterProps & {
  children?: VDom | VDom[];
}) => {
  // There is some kind of race condition setTimeout fixes
  setTimeout(() => sub.publish({ type: "props", props }), 0);

  // @ts-ignore
  return <intersection-observer-emitter id={props.id} />;
};
