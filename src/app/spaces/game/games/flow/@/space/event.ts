import { UserId } from '~/app/@/data/user-id'

export type FlowSpaceEvt = {
  t: 'user-clicked-exit-mode-button'
  userId: UserId
}
