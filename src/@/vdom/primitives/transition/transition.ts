import { h } from '~/@/vdom/h'
import type { VDom } from '~/@/vdom/vdom'
import { TRANSITION_ELEMENT_TAG } from '../../tags'
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
  return h(TRANSITION_ELEMENT_TAG, { id: id }, [children])
}
