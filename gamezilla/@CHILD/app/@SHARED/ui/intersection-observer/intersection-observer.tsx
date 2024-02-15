import { VDomChildren } from "gamezilla/@SHARED/vdom"
import "./intersection-observer-element"
import {
  IntersectionObserverEmitterProps,
  sub,
} from "./intersection-observer-shared"

export const IntersectionObserverEmitter = ({
  children,
  ...props
}: IntersectionObserverEmitterProps & {
  children?: VDomChildren
}) => {
  // There is some kind of race condition setTimeout fixes
  setTimeout(() => sub.publish({ type: "props", props }), 0)

  // @ts-ignore
  return <intersection-observer-dispatchter id={props.id} />
}
