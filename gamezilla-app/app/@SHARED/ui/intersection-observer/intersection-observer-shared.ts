import { PubSub } from "gamezilla-app/@shared/core"

export type IntersectionObserverEmitterProps = {
  onVisible?: () => void
  onHidden?: () => void
  className?: string
  id: string
}

export type IntersectionObserverEmitterEvent = {
  type: "props"
  props: IntersectionObserverEmitterProps
}

export const sub = PubSub.create<IntersectionObserverEmitterEvent>()
