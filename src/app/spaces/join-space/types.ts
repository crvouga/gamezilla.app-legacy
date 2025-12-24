import { SpaceId } from '~/app/@/data/space-id'
import { UserId } from '~/app/@/data/user-id'
import { MsgSpace } from '../space/msg-space'

export type Msg =
  | { t: 'joinSpace_submittedJoinSpaceForm'; spaceId: SpaceId }
  | { t: 'joinSpace_clickedPersonMenuItem'; userId: UserId }
  | { t: 'joinSpace_closedPersonItemSurface' }
  | { t: 'joinSpace_openedPersonDetails'; userId: UserId }
  | { t: 'joinSpace_clickedBackButton' }
  | { t: 'joinSpace_gotMsgSpace'; c: MsgSpace }
