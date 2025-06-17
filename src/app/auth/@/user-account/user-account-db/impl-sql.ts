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
}

export const UserAccountDb = ({ sqlDb }: Config): IUserAccountDb => {
  return {
    async findOneByUserId(input) {
      if (!UserId.is(input.userId)) {
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
        return queried
      }

      const row = queried.value[0] ?? null

      if (!row) {
        return Ok(null)
      }

      const account = toAccount(row)

      return account
    },

    async findOneByPhoneNumber(input) {
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
        return queried
      }

      const row = queried.value[0] ?? null

      if (!row) {
        return Ok(null)
      }

      const account = toAccount(row)

      return account
    },
    async insert(input) {
      const row = {
        created_at_unix_ms: input.createdAt,
        id: input.userId,
        user_role: input.role,
        phone_number: input.phoneNumber ? PhoneNumber.toString(input.phoneNumber) : null,
      }
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
        vars: row,
      })
      return Result.mapOk(inserted, () => null)
    },
  }
}
