import { isAnyMsg } from '~/@/msg/msg'
import { SpaceId } from '~/app/@/data/space-id'

export type MsgFrontend =
  | { t: 'endSpace_clickedEndSpaceButton'; spaceId: SpaceId }
  | { t: 'endSpace_submittedEndSpaceForm'; spaceId: SpaceId }
  | { t: 'endSpace_clickedBackButton' }

export const isMsgFrontend = (msg: unknown): msg is MsgFrontend => {
  return isAnyMsg(msg) && msg.t.startsWith('endSpace_')
}
