import { ClientId, Posix, SessionId } from "gamezilla/@/core";
import { UserId } from "gamezilla/app/@/data";
import { DbConnSql } from "./server-db-conn-sql";

export type ServerCtx = {
  mySql: DbConnSql;
  now: Posix;
};

export type AnonymousReqCtx = ServerCtx & {
  sessionId: SessionId;
  clientId: ClientId;
};

export type ReqCtx = AnonymousReqCtx & {
  currentUserId: UserId;
};
