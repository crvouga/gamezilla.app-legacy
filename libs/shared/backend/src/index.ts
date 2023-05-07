import { Posix } from '@gamezilla/shared/core';
import { ClientId, SessionId, UserId } from '@gamezilla/shared';
import { DatabaseConnectionMySQL } from './database-connection-mysql';

export * from './database-connection-mysql';
export * from './database-connection-postgres';
export * from './shared';

export type AppMsg = {
  t: 'client-connected';
  clientId: ClientId;
  sessionId: SessionId;
  userId?: UserId;
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
