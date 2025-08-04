import { Sub } from '~/@/sub'

export type TransitionProps = {
  id: string
  onEnter: (node: HTMLElement) => Promise<void>
  onExit: (node: HTMLElement) => Promise<void>
  onAppear?: (node: HTMLElement) => Promise<void>
  mode: 'in-out' | 'out-in'
  appear?: boolean
}

export type TransitionEvent = TransitionProps & {
  type: 'input'
}

export const transitionSub = Sub.init<TransitionEvent>()
