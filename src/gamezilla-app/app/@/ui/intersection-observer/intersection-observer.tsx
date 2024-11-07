import type { VDomChildren } from '@/vdom'
import './intersection-observer-element'
import { type IntersectionObserverEmitterinput, sub } from './intersection-observer-shared'

export const IntersectionObserverEmitter = (
  input: IntersectionObserverEmitterinput & {
    children?: VDomChildren
  }
) => {
  // There is some kind of race condition setTimeout fixes
  setTimeout(() => sub.pub({ type: 'input', input }), 1)

  return <intersection-observer-dispatcher id={input.id} />
}
