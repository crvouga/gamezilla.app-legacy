import { SessionId } from "gamezilla/@CHILD/app/@SHARED/data"

export type MsgServerToMsgClient<MsgToClient> =
  | {
      t: "to-client"
      msgs: MsgToClient[]
      codebaseVersionId: string
    }
  | {
      t: "session-id"
      sessionId: SessionId
      codebaseVersionId: string
    }

export type MsgClientToMsgServer<MsgToServer> = {
  t: "to-server"
  msgs: MsgToServer[]
  codebaseVersionId: string
}
