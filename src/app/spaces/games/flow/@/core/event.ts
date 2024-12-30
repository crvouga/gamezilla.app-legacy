import { UserId } from '~/app/@/data/user-id'

export type FlowCoreEvent = {
  t: 'user-clicked-exit-mode-button'
  userId: UserId
}
