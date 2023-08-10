import { ClientId, Posix, SessionId } from "gamezilla/@/core";
import { UserId } from "gamezilla/app/@";
import { DbConnMySql } from "./db-conn-mysql";

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
