import { UserId } from '~/app/@/data/user-id'

export type FlowSpaceEvt = {
  t: 'userClickedExitModeButton'
  userId: UserId
}
