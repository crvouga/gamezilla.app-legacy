import type { VDomChildren } from '~/@/vdom/vdom'
import './transition-element'
import { type Transitioninput, transitionSub } from './transition-shared'

export const Transition = ({
  id,
  onEnter,
  onExit,
  onAppear,
  children,
  className,
  mode
}: Transitioninput & {
  children?: VDomChildren
}) => {
  transitionSub.pub({
    type: 'input',
    id,
    onEnter,
    onExit,
    onAppear,
    className: className,
    mode
  })
  // @ts-ignore
  return <transition-element id={id}>{children}</transition-element>
}
