import { SessionId } from "gamezilla/@CHILD/app/@SHARED/data"

export type ISessionDb = {
  findClientBySessionId: (sessionId: SessionId) => Promise<{} | null>
  findClientsByUserId: (userId: string) => Promise<{}[]>
}
