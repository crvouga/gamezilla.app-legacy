import { SessionId } from "gamezilla-app/@CHILD/app/@SHARED/data"

export type ISessionDb = {
  findClientBySessionId: (sessionId: SessionId) => Promise<{} | null>
  findClientsByUserId: (userId: string) => Promise<{}[]>
}
