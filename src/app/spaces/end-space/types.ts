import { SpaceId } from '~/app/@/data/space-id'
import { MsgSpace } from '../space/msg-space'

export type Msg =
  | { n: 'endSpace'; t: 'clickedEndSpaceButton'; spaceId: SpaceId }
  | { n: 'endSpace'; t: 'submittedEndSpaceForm'; spaceId: SpaceId }
  | { n: 'endSpace'; t: 'clickedBackButton' }
  | { n: 'endSpace'; t: 'gotMsgSpace'; c: MsgSpace }
