import { ClientId, Posix, SessionId } from "gamezilla/@/core";
import { UserId } from "gamezilla/app/@";
import { DbConnSql } from "./server-db-conn-sql";

export type ServerCtx = {
  mySql: DbConnSql;
  now: Posix;
};

export type ServerUnauthenticatedReqCtx = ServerCtx & {
  sessionId: SessionId;
  clientId: ClientId;
};

export type ServerReqCtx = ServerUnauthenticatedReqCtx & {
  currentUserId: UserId;
};
