import { UserId } from 'app/@/data'

export type FlowCoreEvent = {
  t: 'user-clicked-exit-mode-button'
  userId: UserId
}
