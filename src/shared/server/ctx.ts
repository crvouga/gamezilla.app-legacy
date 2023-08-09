import { ClientId, Posix, SessionId } from "src/core";
import { UserId } from "src/shared/app";
import { DbConnMySql } from "./database-connection-mysql";

export type ServerCtx = {
  mySql: DbConnMySql;
  now: Posix;
};

export type ServerUnauthenticatedReqCtx = ServerCtx & {
  sessionId: SessionId;
  clientId: ClientId;
};

export type ServerReqCtx = ServerUnauthenticatedReqCtx & {
  currentUserId: UserId;
};
