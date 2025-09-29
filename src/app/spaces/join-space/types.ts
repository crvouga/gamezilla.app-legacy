import { SpaceId } from '~/app/@/data/space-id'
import { UserId } from '~/app/@/data/user-id'

export type MsgFrontend =
  | { t: 'joinSpace_submittedJoinSpaceForm'; spaceId: SpaceId }
  | { t: 'joinSpace_clickedPersonMenuItem'; userId: UserId }
  | { t: 'joinSpace_closedPersonItemSurface' }
  | { t: 'joinSpace_openedPersonDetails'; userId: UserId }
