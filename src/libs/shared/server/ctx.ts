import { ClientId, SessionId, UserId } from "@gamezilla/shared/app";
import { Posix } from "@gamezilla/shared/core";
import { DbConnMySql } from "./database-connection-mysql";

//
//
//
//
//
//

export type ServerAppMsg =
  | {
      t: "client-connected";
      clientId: ClientId;
      sessionId: SessionId;
      userId?: UserId;
    }
  | {
      t: "client-authenticated";
      userId: UserId;
      clientId: ClientId;
    };

//
//
//
//
//
//
//

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

export type SpaceServerCtx = ServerCtx & {
  hostId: UserId;
};

export type SpaceReqServerCtx = SpaceServerCtx & AuthReqServerCtx;
