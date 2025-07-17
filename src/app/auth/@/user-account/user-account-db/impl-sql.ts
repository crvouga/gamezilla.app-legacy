import { pipe } from '~/@/function/pipe'
import { ILogger } from '~/@/logger'
import { PhoneNumber } from '~/@/phone-number'
import { Err, Ok, Result, isErr } from '~/@/result'
import { s } from '~/@/schema'
import { ParseError } from '~/@/schema/schema/parse-error'
import type { ISqlDb } from '~/@/sql-db'
import { ISqlDbMigrationPolicy } from '~/@/sql-db-migration-policy'
import { UnixMs } from '~/@/time/unix-ms'
import { UserAccount } from '~/app/@/data/user-account'
import { UserId } from '~/app/@/data/user-id'
import { UserRole } from '~/app/@/data/user-role'
import type { IUserAccountDb } from './interface'

export const Row = s.obj({
  id: s.str(),
  created_at_unix_ms: s.or(s.str(), s.num()),
  user_role: UserRole,
  phone_number: s.maybe(s.str()),
})
export type Row = s.Infer<typeof Row>

const toAccount = (row: Row): Result<string, UserAccount> => {
  const userId = Result.unwrapOr(UserId.parse(row.id), null)

  if (!userId) {
    return Err('Invalid account. Missing userId.')
  }

  const account: UserAccount = {
    userId,
    role: row.user_role,
    createdAt: UnixMs.init(row.created_at_unix_ms),
    phoneNumber: Result.unwrapOr(PhoneNumber.fromString(row.phone_number), null),
  }

  return Ok(account)
}

UserAccount.fromUnknownRegister((data) => {
  return pipe(
    data,
    (x) => Row.parse(x),
    (x) => Result.mapErr(x, ParseError.toString),
    (x) => Result.flatMapOk(x, toAccount),
  )
})

export type Config = {
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

export const UserAccountDb = (config: Config): IUserAccountDb => {
  const logger = config.logger.child(['user-account-db'])

  config.migrationPolicy.execute({
    down: DOWN,
    sqlDb: config.sqlDb,
    up: UP,
  })

  return {
    async findOneByUserId(input) {
      logger.debug(`Finding user account by userId=${input.userId}`)

      if (!UserId.is(input.userId)) {
        logger.debug(`Invalid userId=${input.userId}`)
        return Ok(null)
      }

      const queried = await config.sqlDb.query({
        schema: Row,
        sql: `
        SELECT
					id,
					created_at_unix_ms,
					user_role,
					phone_number
				FROM
					user_account
				WHERE
					id = :id
				`,
        vars: {
          id: input.userId,
        },
      })

      if (isErr(queried)) {
        logger.error(`Database error while finding by userId: ${queried.error}`)
        return queried
      }

      const row = queried.value[0] ?? null

      if (!row) {
        logger.debug(`No user account found for userId=${input.userId}`)
        return Ok(null)
      }

      const account = toAccount(row)

      if (isErr(account)) {
        logger.error(`Failed to parse account: ${account.error}`)
        return account
      }

      logger.debug(`Found user account for userId=${input.userId}`)
      return account
    },

    async findOneByPhoneNumber(input) {
      logger.debug(`Finding user account by phoneNumber=${PhoneNumber.toString(input.phoneNumber)}`)

      const queried = await config.sqlDb.query({
        schema: Row,
        sql: `
				SELECT
					id,
					created_at_unix_ms,
					user_role,
					phone_number
				FROM
					user_account
				WHERE
					phone_number = :phone_number
				`,
        vars: {
          phone_number: PhoneNumber.toString(input.phoneNumber),
        },
      })

      if (isErr(queried)) {
        logger.error(`Database error while finding by phone number: ${queried.error}`)
        return queried
      }

      const row = queried.value[0] ?? null

      if (!row) {
        logger.debug(`No user account found for phoneNumber=${PhoneNumber.toString(input.phoneNumber)}`)
        return Ok(null)
      }

      const account = toAccount(row)

      if (isErr(account)) {
        logger.error(`Failed to parse account: ${account.error}`)
        return account
      }

      logger.debug(`Found user account for phoneNumber=${PhoneNumber.toString(input.phoneNumber)}`)
      return account
    },
    async upsert(input) {
      logger.debug(`Upserting user account for userId=${input.userId}`)

      const existing = await this.findOneByUserId({
        userId: input.userId,
      })

      if (isErr(existing)) {
        logger.error(`Failed to check for existing account: ${existing.error}`)
        return existing
      }

      if (existing.value) {
        logger.debug(`Updating existing user account for userId=${input.userId}`)
        const updated = await config.sqlDb.query({
          schema: s.unknown,
          sql: `
          UPDATE user_account SET
          phone_number = :phone_number,
          user_role = :user_role,
          id = :id,
          created_at_unix_ms = :created_at_unix_ms
          WHERE id = :id
          `,
          vars: {
            created_at_unix_ms: input.createdAt,
            id: input.userId,
            user_role: input.role,
            phone_number: input.phoneNumber ? PhoneNumber.toString(input.phoneNumber) : null,
          },
        })

        if (isErr(updated)) {
          logger.error(`Failed to update user account: ${updated.error}`)
          return updated
        }

        logger.debug(`Successfully updated user account for userId=${input.userId}`)
        return Result.mapOk(updated, () => null)
      }

      logger.debug(`Inserting new user account for userId=${input.userId}`)
      const inserted = await config.sqlDb.query({
        schema: s.unknown,
        sql: `
        INSERT INTO user_account (
					phone_number,
					user_role,
					id,         
					created_at_unix_ms
				)
				VALUES (
					:phone_number,
					:user_role,
					:id,
					:created_at_unix_ms
				)`,
        vars: {
          created_at_unix_ms: input.createdAt,
          id: input.userId,
          user_role: input.role,
          phone_number: input.phoneNumber ? PhoneNumber.toString(input.phoneNumber) : null,
        },
      })

      if (isErr(inserted)) {
        logger.error(`Failed to insert user account: ${inserted.error}`)
        return inserted
      }

      logger.debug(`Successfully inserted new user account for userId=${input.userId}`)
      return Result.mapOk(inserted, () => null)
    },
  }
}
