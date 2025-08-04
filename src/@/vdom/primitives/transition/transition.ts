import { h } from '~/@/vdom/h'
import type { VDom } from '~/@/vdom/vdom'
import { TRANSITION_ELEMENT_TAG } from '../../tags'
import './transition-element'
import { type TransitionProps, transitionSub } from './transition-shared'

export const Transition = ({
  id,
  onEnter,
  onExit,
  onAppear,
  children,
  mode,
}: TransitionProps & {
  children?: VDom
}) => {
  transitionSub.pub({
    type: 'input',
    id,
    onEnter,
    onExit,
    onAppear,
    mode,
  })
  return h(TRANSITION_ELEMENT_TAG, { id: id }, [children])
}
