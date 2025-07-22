import type { VDom } from '~/@/vdom/vdom'
import { h } from '~/@/vdom/h'
import './transition-element'
import { type TransitionInput, transitionSub } from './transition-shared'

export const Transition = ({
  id,
  onEnter,
  onExit,
  onAppear,
  children,
  class: class_,
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
    class: class_,
    mode,
  })
  // @ts-ignore
  return h('transition-element', { id: id }, [children])
}
