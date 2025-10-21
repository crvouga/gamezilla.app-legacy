import { SpaceId } from '~/app/@/data/space-id'

export type MsgFrontend =
  | { t: 'leaveSpace_clickedLeaveSpaceButton'; spaceId: SpaceId }
  | { t: 'leaveSpace_submittedLeaveSpaceButton'; spaceId: SpaceId }
