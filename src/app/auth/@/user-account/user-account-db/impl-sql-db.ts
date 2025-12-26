import { Db } from '~/@/db/impl/impl'
import { ILogger } from '~/@/logger'
import { PhoneNumber } from '~/@/phone-number'
import { unwrapOr } from '~/@/result'
import { s } from '~/@/schema'
import { ISqlDbMigrationPolicy } from '~/@/sql-db-migration-policy/interface'
import type { ISqlDb } from '~/@/sql-db/interface'
import { UnixMs } from '~/@/time/unix-ms'
import { UserId } from '~/app/@/data/user-id'
import { UserRole } from '~/app/@/data/user-role'
import { IUserAccountDb } from './interface'

export type ImplSqlDb = {
  t: 'sql'
  sqlDb: ISqlDb
  logger: ILogger
  migrationPolicy: ISqlDbMigrationPolicy
}

const UP: string[] = [
  `
  CREATE TABLE IF NOT EXISTS user_account (
    id TEXT NOT NULL PRIMARY KEY,
    created_at_unix_ms BIGINT NOT NULL,
    user_role TEXT NOT NULL CHECK (user_role IN ('super', 'normal', 'guest')),
    phone_number TEXT
  );
  `,
]

const DOWN: string[] = [
  `
  DROP TABLE IF EXISTS user_account;
  `,
]

const init = async (config: ImplSqlDb): Promise<IUserAccountDb> => {
  const logger = config.logger.child(['impl-sql'])

  return Db.init({
    t: 'sql-db',
    logger,
    interface: IUserAccountDb,
    sqlDb: config.sqlDb,
    migration: {
      policy: config.migrationPolicy,
      up: UP,
      down: DOWN,
    },
    getRelated: async () => ({}),
    viewName: 'user_account',
    primaryKey: 'id',
    schema: s.obj({
      id: UserId,
      created_at_unix_ms: s.or(s.str(), s.num()),
      user_role: UserRole,
      phone_number: s.maybe(s.str()),
    }),
    mapValueEntityToSql: {
      userId: (userId) => userId,
      createdAt: (createdAt) => createdAt,
      role: (role) => role,
      phoneNumber: (phoneNumber) => (phoneNumber ? PhoneNumber.toString(phoneNumber) : null),
    },
    mapValueSqlToEntity: {
      id: (id) => id,
      created_at_unix_ms: (created_at_unix_ms) => UnixMs.init(created_at_unix_ms),
      user_role: (user_role) => user_role,
      phone_number: (phone_number) => (phone_number ? unwrapOr(PhoneNumber.fromString(phone_number), null) : null),
    },
    mapKeyEntityToSql: {
      userId: 'id',
      createdAt: 'created_at_unix_ms',
      role: 'user_role',
      phoneNumber: 'phone_number',
    },
    mapKeySqlToEntity: {
      id: 'userId',
      created_at_unix_ms: 'createdAt',
      user_role: 'role',
      phone_number: 'phoneNumber',
    },
  })
}

export const ImplSqlDb = {
  init,
}
