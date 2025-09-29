import { isAnyMsg } from '~/@/msg/msg'
import { SpaceId } from '~/app/@/data/space-id'

export type MsgFrontend = { t: 'listSpaces_clickedSpaceCard'; spaceId: SpaceId }

export const isMsgFrontend = (msg: unknown): msg is MsgFrontend => {
  return isAnyMsg(msg) && msg.t.startsWith('listSpaces_')
}
