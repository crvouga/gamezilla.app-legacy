import { ClientId, SessionId, UserId } from "gamezilla/@CHILD/app/@SHARED/data";
import { Posix } from "gamezilla/@SHARED/core";
import { DbConnSql } from "./db-conn-sql/db-conn-sql-interface";
import { SMS } from "./sms";

export type ServerCtx = {
  dbConn: DbConnSql;
  sms: SMS;
  now: Posix;
};

export type AnonymousReqCtx = ServerCtx & {
  sessionId: SessionId;
  clientId: ClientId;
};

export type ReqCtx = AnonymousReqCtx & {
  currentUserId: UserId;
};
