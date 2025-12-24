import { WithEventId } from '~/@/event-sourced/event'
import { SpaceId } from '~/app/@/data/space-id'
import { MsgSpace } from '../space/msg-space'

export type Msg =
  | { t: 'leaveSpace_clickedLeaveSpaceButton'; spaceId: SpaceId }
  | { t: 'leaveSpace_submittedLeaveSpaceButton'; spaceId: SpaceId }
  | { t: 'leaveSpace_gotMsgSpace'; c: WithEventId<MsgSpace> }
