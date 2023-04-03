import { Posix } from '@gamezilla/core';
import { ClientId, SessionId, UserId } from '@gamezilla/shared';
import { DatabaseConnectionMySQL } from './database-connection-mysql';
import { DatabaseConnectionPostgres } from './database-connection-postgres';

export * from './database-connection-mysql';
export * from './database-connection-postgres';
export * from './shared';

export type AppMsg = ['client-connected', { clientId: ClientId }];

export type Ctx = {
  dbConn: DatabaseConnectionPostgres;
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
