import { ClientId, SessionId, UserId } from "gamezilla/@CHILD/app/@SHARED/data";
import { Posix } from "gamezilla/@SHARED/core";
import { DbConnSql } from "./db-conn-sql-interface";
import { Logger } from "./logger";
import { SMS } from "./sms-interface";

export type ServerCtx = {
  dbConn: DbConnSql;
  sms: SMS;
  now: Posix;
  logger: Logger;
};

export type AnonymousReqCtx = ServerCtx & {
  sessionId: SessionId;
  clientId: ClientId;
};

export type ReqCtx = AnonymousReqCtx & {
  currentUserId: UserId;
};
