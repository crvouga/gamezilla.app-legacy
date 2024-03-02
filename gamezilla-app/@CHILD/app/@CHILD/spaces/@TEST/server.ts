import {
  ClientId,
  SessionId,
  SpaceId,
  UserId,
} from "gamezilla-app/@CHILD/app/@SHARED/data"
import { ServerCtx } from "gamezilla-app/@CHILD/app/@SHARED/server"
import { dbConnNoop } from "gamezilla-app/@CHILD/app/@SHARED/server/db-conn-sql"
import { LoggerConsole } from "gamezilla-app/@CHILD/app/@SHARED/server/logger"
import { Posix } from "gamezilla-app/@SHARED/core"
import { LamportTimestamp } from "gamezilla-app/@SHARED/lamport-clock"
import { EventId } from "../@SHARED/event"
import { ModelServer, ServerDeps } from "../spaces.core"
import * as SpacesServer from "../spaces.server"
import { Space } from "../spaces-core"

export const ctx: ServerCtx = {
  dbConn: dbConnNoop,
  logger: LoggerConsole("test"),
  now: Posix.now(),
}

export const init = () => {
  return SpacesServer.init({ ctx })
}

export const getDeps = (): ServerDeps => {
  return {}
}

export const generateAuthClient = (): AuthenticatedClient => {
  return {
    clientId: ClientId.generate(),
    sessionId: SessionId.generate(),
    userId: UserId.generate(),
  }
}

export type AuthenticatedClient = {
  clientId: ClientId
  sessionId: SessionId
  userId: UserId
}

export const userStartedSpace =
  (deps: ServerDeps, client: AuthenticatedClient, spaceId: SpaceId) =>
  (model: ModelServer) => {
    return SpacesServer.update({
      ctx,
      deps,
      model,
      msgClient: {
        t: "event",
        clientId: client.clientId,
        sessionId: client.sessionId,
        c: {
          t: "user-started-space",
          eventId: EventId.generate(),
          happenedAt: LamportTimestamp.fromNumber(0),
          spaceId,
          userId: client.userId,
        },
      },
    })
  }

export const authenticatedClientConnected =
  (deps: ServerDeps, client: AuthenticatedClient) => (model: ModelServer) => {
    return SpacesServer.update({
      ctx,
      deps,
      model,
      msgEvt: {
        t: "auth/client-authenticated",
        clientId: client.clientId,
        sessionId: client.sessionId,
        userId: client.userId,
      },
    })
  }

export const clientSync =
  (deps: ServerDeps, client: AuthenticatedClient, space: Space.Model) =>
  (model: ModelServer) => {
    return SpacesServer.update({
      ctx,
      deps,
      model,
      msgClient: {
        t: "sync",
        clientId: client.clientId,
        sessionId: client.sessionId,
        space,
      },
    })
  }
