import { v } from '~/@/vdom/v'
import type { VDom } from '~/@/vdom/vdom'
import './intersection-observer-element'
import { type IntersectionObserverEmitterInput, sub } from './intersection-observer-shared'

export const IntersectionObserverEmitter = (
  input: IntersectionObserverEmitterInput & {
    children?: VDom
  },
) => {
  // There is some kind of race condition setTimeout fixes
  setTimeout(() => sub.pub({ type: 'input', input }), 1)

  return v('intersection-observer-dispatcher', { id: input.id })
}
