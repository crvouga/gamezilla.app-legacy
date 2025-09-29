import { isAnyMsg } from '~/@/msg/msg'

export type MsgFrontend = { t: 'exitSpaceAction_clicked' }

export const isMsgFrontend = (msg: unknown): msg is MsgFrontend => {
  return isAnyMsg(msg) && msg.t.startsWith('exitSpaceAction_')
}
