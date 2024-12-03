import { PubSub } from '~/@/core'

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

export const sub = PubSub.create<IntersectionObserverEmitterEvent>()
