import { Sub } from '~/@/sub'

export type IntersectionObserverEmitterInput = {
  onVisible?: () => void
  onHidden?: () => void
  id: string
}

export type IntersectionObserverEmitterEvent = {
  type: 'input'
  input: IntersectionObserverEmitterInput
}

export const sub = Sub.init<IntersectionObserverEmitterEvent>()
