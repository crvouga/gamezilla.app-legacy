import { isAnyMsg } from '~/@/msg/msg'

export type MsgFrontend = { t: 'currentSpaceMiniPlayer_clicked' }

export const isMsgFrontend = (msg: unknown): msg is MsgFrontend => {
  return isAnyMsg(msg) && msg.t.startsWith('currentSpaceMiniPlayer_')
}
