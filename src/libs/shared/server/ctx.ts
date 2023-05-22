import { ClientId, SessionId, UserId } from '@gamezilla/shared/app';
import { Posix } from '@gamezilla/shared/core';
import { DatabaseConnectionMySQL } from './database-connection-mysql';

export type AppMsg =
  | {
      t: 'client-connected';
      clientId: ClientId;
      sessionId: SessionId;
      userId?: UserId;
    }
  | {
      t: 'client-authenticated';
      userId: UserId;
      clientId: ClientId;
    };

export type Ctx = {
  mySql: DatabaseConnectionMySQL;
  now: Posix;
};

export type RequestCtx = Ctx & {
  sessionId: SessionId;
  clientId: ClientId;
};

export type AuthenticatedRequestCtx = RequestCtx & {
  currentUserId: UserId;
};

export type RoomCtx = Ctx & {
  hostId: UserId;
};

export type RoomRequestCtx = RoomCtx & AuthenticatedRequestCtx;
