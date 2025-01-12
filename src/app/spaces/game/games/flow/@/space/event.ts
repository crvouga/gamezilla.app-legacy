import { UserId } from '~/app/@/data/user-id'

export type FlowSpaceEvent = {
  t: 'user-clicked-exit-mode-button'
  userId: UserId
}
