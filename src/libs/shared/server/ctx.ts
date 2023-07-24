import { Posix } from "@gamezilla/core";
import { ClientId, SessionId, UserId } from "@gamezilla/shared/app";
import { DbConnMySql } from "./database-connection-mysql";

export type ServerCtx = {
  mySql: DbConnMySql;
  now: Posix;
};

export type ReqServerCtx = ServerCtx & {
  sessionId: SessionId;
  clientId: ClientId;
};

export type AuthReqServerCtx = ReqServerCtx & {
  currentUserId: UserId;
};
