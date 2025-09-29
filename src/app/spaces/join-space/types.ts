import { isAnyMsg } from '~/@/msg/msg'
import { SpaceId } from '~/app/@/data/space-id'
import { UserId } from '~/app/@/data/user-id'

export type MsgFrontend =
  | { t: 'joinSpace_submittedJoinSpaceForm'; spaceId: SpaceId }
  | { t: 'joinSpace_clickedPersonMenuItem'; userId: UserId }
  | { t: 'joinSpace_closedPersonItemSurface' }
  | { t: 'joinSpace_openedPersonDetails'; userId: UserId }
  | { t: 'joinSpace_clickedBackButton' }

export const isMsgFrontend = (msg: unknown): msg is MsgFrontend => {
  return isAnyMsg(msg) && msg.t.startsWith('joinSpace_')
}
