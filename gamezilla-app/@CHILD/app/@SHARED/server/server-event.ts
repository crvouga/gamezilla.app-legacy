import {
  ClientId,
  SessionId,
  UserId,
} from "gamezilla-app/@CHILD/app/@SHARED/data"

export type ServerEvent =
  | {
      t: "wire/client-connected"
      clientId: ClientId
      sessionId: SessionId
      userId?: UserId
    }
  | {
      t: "wire/client-disconnected"
      clientId: ClientId
      sessionId: SessionId
    }
  | {
      t: "auth/client-authenticated"
      userId: UserId
      sessionId: SessionId
      clientId: ClientId
      loggedIn?: boolean
    }
  | {
      t: "auth/client-unauthenticated"
      sessionId: SessionId
      clientId: ClientId
    }
