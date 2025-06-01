import { Sub } from '~/@/sub'

export type TransitionInput = {
  id: string
  onEnter: (node: HTMLElement) => Promise<void>
  onExit: (node: HTMLElement) => Promise<void>
  onAppear?: (node: HTMLElement) => Promise<void>
  className?: string
  mode: 'in-out' | 'out-in'
  appear?: boolean
}

export type TransitionEvent = TransitionInput & {
  type: 'input'
}

export const transitionSub = Sub.create<TransitionEvent>()
