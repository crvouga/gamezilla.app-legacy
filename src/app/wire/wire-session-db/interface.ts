import type { Task } from '@/core'
import { SessionId, UserId } from 'app/@/data'
import { WireSession } from '../wire-session'

export type IWireSessionDb = {
  put: (wireSession: WireSession[]) => Task<string, null>
  findBySessionIds: (sessionIds: SessionId[]) => Task<string, WireSession[]>
  findByUserIds: (userIds: UserId[]) => Task<string, WireSession[]>
}
