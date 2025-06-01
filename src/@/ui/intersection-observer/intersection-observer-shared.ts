import { Sub } from '~/@/sub'

export type IntersectionObserverEmitterinput = {
  onVisible?: () => void
  onHidden?: () => void
  className?: string
  id: string
}

export type IntersectionObserverEmitterEvent = {
  type: 'input'
  input: IntersectionObserverEmitterinput
}

export const sub = Sub.create<IntersectionObserverEmitterEvent>()
