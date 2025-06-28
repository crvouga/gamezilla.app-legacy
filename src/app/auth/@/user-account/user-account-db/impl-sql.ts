import { pipe } from '~/@/function/pipe'
import { PhoneNumber } from '~/@/phone-number'
import { Err, Ok, Result, isErr } from '~/@/result'
import { s } from '~/@/schema'
import { ParseError } from '~/@/schema/schema/parse-error'
import type { ISqlDb } from '~/@/sql-db'
import { UnixMs } from '~/@/time/unix-ms'
import { UserAccount } from '~/app/@/data/user-account'
import { UserId } from '~/app/@/data/user-id'
import { UserRole } from '~/app/@/data/user-role'
import type { IUserAccountDb } from './interface'
import { ILogger } from '~/@/logger'

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
}

export const UserAccountDb = ({ sqlDb, logger }: Config): IUserAccountDb => {
  const log = logger.child(['user-account-db'])

  return {
    async findOneByUserId(input) {
      log.debug(`Finding user account by userId=${input.userId}`)

      if (!UserId.is(input.userId)) {
        log.debug(`Invalid userId=${input.userId}`)
        return Ok(null)
      }

      const queried = await sqlDb.query({
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
        log.error(`Database error while finding by userId: ${queried.error}`)
        return queried
      }

      const row = queried.value[0] ?? null

      if (!row) {
        log.debug(`No user account found for userId=${input.userId}`)
        return Ok(null)
      }

      const account = toAccount(row)

      if (isErr(account)) {
        log.error(`Failed to parse account: ${account.error}`)
        return account
      }

      log.debug(`Found user account for userId=${input.userId}`)
      return account
    },

    async findOneByPhoneNumber(input) {
      log.debug(`Finding user account by phoneNumber=${PhoneNumber.toString(input.phoneNumber)}`)

      const queried = await sqlDb.query({
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
        log.error(`Database error while finding by phone number: ${queried.error}`)
        return queried
      }

      const row = queried.value[0] ?? null

      if (!row) {
        log.debug(`No user account found for phoneNumber=${PhoneNumber.toString(input.phoneNumber)}`)
        return Ok(null)
      }

      const account = toAccount(row)

      if (isErr(account)) {
        log.error(`Failed to parse account: ${account.error}`)
        return account
      }

      log.debug(`Found user account for phoneNumber=${PhoneNumber.toString(input.phoneNumber)}`)
      return account
    },
    async upsert(input) {
      log.debug(`Upserting user account for userId=${input.userId}`)

      const existing = await this.findOneByUserId({
        userId: input.userId,
      })

      if (isErr(existing)) {
        log.error(`Failed to check for existing account: ${existing.error}`)
        return existing
      }

      if (existing.value) {
        log.debug(`Updating existing user account for userId=${input.userId}`)
        const updated = await sqlDb.query({
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
          log.error(`Failed to update user account: ${updated.error}`)
          return updated
        }

        log.debug(`Successfully updated user account for userId=${input.userId}`)
        return Result.mapOk(updated, () => null)
      }

      log.debug(`Inserting new user account for userId=${input.userId}`)
      const inserted = await sqlDb.query({
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
        log.error(`Failed to insert user account: ${inserted.error}`)
        return inserted
      }

      log.debug(`Successfully inserted new user account for userId=${input.userId}`)
      return Result.mapOk(inserted, () => null)
    },
  }
}
