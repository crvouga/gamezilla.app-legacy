import type { Task } from '~/@/promise/task'
import { SessionId } from '~/@/wire/session-id'
import { UserId } from '~/app/@/data/user-id'
import { WireSession } from '../wire-session'

export type IWireSessionDb = {
  put: (wireSession: WireSession[]) => Task<string, null>
  findBySessionIds: (sessionIds: SessionId[]) => Task<string, WireSession[]>
  findByUserIds: (userIds: UserId[]) => Task<string, WireSession[]>
}
