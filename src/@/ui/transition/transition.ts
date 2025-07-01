import type { VDom } from '~/@/vdom/vdom'
import { v } from '~/@/vdom/v'
import './transition-element'
import { type TransitionInput, transitionSub } from './transition-shared'

export const Transition = ({
  id,
  onEnter,
  onExit,
  onAppear,
  children,
  className,
  mode,
}: TransitionInput & {
  children?: VDom
}) => {
  transitionSub.pub({
    type: 'input',
    id,
    onEnter,
    onExit,
    onAppear,
    className: className,
    mode,
  })
  return v('transition-element', { id: id }, [children])
}
