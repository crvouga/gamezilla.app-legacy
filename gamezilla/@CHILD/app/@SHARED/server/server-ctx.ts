import { Posix } from "gamezilla/@SHARED/core";
import { ClientId, SessionId, UserId } from "gamezilla/@CHILD/app/@SHARED/data";
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
