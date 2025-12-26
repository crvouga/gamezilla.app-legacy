import { Db } from '~/@/db/impl/impl'
import { ILogger } from '~/@/logger'
import { s } from '~/@/schema'
import { ISqlDbMigrationPolicy } from '~/@/sql-db-migration-policy/interface'
import type { ISqlDb } from '~/@/sql-db/interface'
import { UnixMs } from '~/@/time/unix-ms'
import { ClientSessionId } from '~/@/wire/client-session-id'
import { SessionId } from '~/@/wire/session-id'
import { UserId } from '~/app/@/data/user-id'
import { UserSessionId } from '../user-session-id'
import { IUserSessionDb } from './interface'

export type ImplSqlDb = {
  t: 'sql'
  sqlDb: ISqlDb
  logger: ILogger
  migrationPolicy: ISqlDbMigrationPolicy
}

const UP: string[] = [
  `
  CREATE TABLE IF NOT EXISTS user_session (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    session_id TEXT,
    client_session_id TEXT NOT NULL,
    created_at_unix_ms BIGINT NOT NULL,
    ended_at_unix_ms BIGINT
  );
  `,
  `
  CREATE INDEX IF NOT EXISTS user_session_user_id_idx ON user_session (user_id);
  `,
  `
  CREATE INDEX IF NOT EXISTS user_session_session_id_idx ON user_session (session_id);
  `,
  `
  CREATE INDEX IF NOT EXISTS user_session_client_session_id_idx ON user_session (client_session_id);
  `,
]

const DOWN: string[] = [
  `
  DROP INDEX IF EXISTS user_session_user_id_idx;
  `,
  `
  DROP INDEX IF EXISTS user_session_session_id_idx;
  `,
  `
  DROP INDEX IF EXISTS user_session_client_session_id_idx;
  `,
  `
  DROP TABLE IF EXISTS user_session;
  `,
]

const init = async (config: ImplSqlDb): Promise<IUserSessionDb> => {
  const logger = config.logger.child(['impl-sql'])

  return Db.init({
    t: 'sql-db',
    logger,
    interface: IUserSessionDb,
    sqlDb: config.sqlDb,
    migration: {
      policy: config.migrationPolicy,
      up: UP,
      down: DOWN,
    },
    getRelated: async () => ({}),
    viewName: 'user_session',
    primaryKey: 'id',
    schema: s.obj({
      id: UserSessionId,
      session_id: s.maybe(SessionId),
      client_session_id: ClientSessionId,
      user_id: UserId,
      created_at_unix_ms: s.or(s.str(), s.num()),
      ended_at_unix_ms: s.maybe(s.or(s.str(), s.num())),
    }),
    mapKeyEntityToSql: {
      userSessionId: 'id',
      sessionId: 'session_id',
      clientSessionId: 'client_session_id',
      userId: 'user_id',
      createdAt: 'created_at_unix_ms',
      endedAt: 'ended_at_unix_ms',
    },
    mapKeySqlToEntity: {
      id: 'userSessionId',
      session_id: 'sessionId',
      client_session_id: 'clientSessionId',
      user_id: 'userId',
      created_at_unix_ms: 'createdAt',
      ended_at_unix_ms: 'endedAt',
    },
    mapValueEntityToSql: {
      userSessionId: (userSessionId) => userSessionId,
      sessionId: (sessionId) => sessionId ?? null,
      clientSessionId: (clientSessionId) => clientSessionId,
      userId: (userId) => userId,
      createdAt: (createdAt) => createdAt,
      endedAt: (endedAt) => endedAt ?? null,
    },
    mapValueSqlToEntity: {
      id: (id) => id,
      session_id: (session_id) => session_id,
      client_session_id: (client_session_id) => client_session_id,
      user_id: (user_id) => user_id,
      created_at_unix_ms: (created_at_unix_ms) => UnixMs.init(created_at_unix_ms),
      ended_at_unix_ms: (ended_at_unix_ms) => (ended_at_unix_ms ? UnixMs.init(ended_at_unix_ms) : null),
    },
  })
}

export const ImplSqlDb = {
  init,
}
