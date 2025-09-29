import { isAnyMsg } from '~/@/msg/msg'
import { SpaceId } from '~/app/@/data/space-id'

export type MsgFrontend =
  | { t: 'leaveSpace_clickedLeaveSpaceButton'; spaceId: SpaceId }
  | { t: 'leaveSpace_submittedLeaveSpaceButton'; spaceId: SpaceId }

export const isMsgFrontend = (msg: unknown): msg is MsgFrontend => {
  return isAnyMsg(msg) && msg.t.startsWith('leaveSpace_')
}
