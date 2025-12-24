import { SpaceId } from '~/app/@/data/space-id'
import { MsgSpace } from '../space/msg-space'

export type Msg =
  | { t: 'startSpace_clickedStartSpaceButton'; spaceId: SpaceId }
  | { t: 'startSpace_gotMsgSpace'; c: MsgSpace }
