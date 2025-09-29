import { isAnyMsg } from '~/@/msg/msg'
import { UserId } from '~/app/@/data/user-id'

export type MsgFrontend =
  | { t: 'peopleAction_closedSurface' }
  | { t: 'peopleAction_clickedPeopleAction' }
  | { t: 'peopleAction_clickedPersonMenuItem'; userId: UserId }
  | { t: 'peopleAction_clickedPreviewUserLink' }

export const isMsgFrontend = (msg: unknown): msg is MsgFrontend => {
  return isAnyMsg(msg) && msg.t.startsWith('peopleAction_')
}
