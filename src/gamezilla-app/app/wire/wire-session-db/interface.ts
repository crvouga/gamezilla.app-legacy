import type { Task } from 'gamezilla-app/@/core'
import { SessionId, UserId } from 'gamezilla-app/app/@/data'
import { WireSession } from '../wire-session'

export type IWireSessionDb = {
  put: (wireSession: WireSession[]) => Task<string, null>
  findBySessionIds: (sessionIds: SessionId[]) => Task<string, WireSession[]>
  findByUserIds: (userIds: UserId[]) => Task<string, WireSession[]>
}
