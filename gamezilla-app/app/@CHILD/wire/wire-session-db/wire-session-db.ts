import { SessionId, UserId } from "gamezilla-app/app/@SHARED/data"
import { Client } from "../wire.core"
import { Task } from "gamezilla-app/@SHARED/core"

export type IWireSessionDb = {
  clients: {
    findBySessionIds: (sessionIds: SessionId[]) => Task<string, Client[]>
    set: (sessionId: SessionId, client: Client) => Task<string, null>
  }
  sessionIds: {
    findByUserIds: (userIds: UserId[]) => Task<string, SessionId[]>
    set: (userId: UserId, sessionIds: SessionId[]) => Task<string, null>
  }
}
