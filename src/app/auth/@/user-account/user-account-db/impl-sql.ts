import type { SqlDb } from '~/@/sql-db'
import { s } from '~/@/schema'
import { PhoneNumber } from '~/@/phone-number'
import { Err, Ok, Result, isErr } from '~/@/result'
import { Posix } from '~/@/time/posix'
import type { UserAccount } from '~/app/@/data/user-account'
import { UserId } from '~/app/@/data/user-id'
import { UserRole } from '~/app/@/data/user-role'
import type { IUserAccountDb } from './interface'

export const UserAccountRow = s.obj({
  id: s.str(),
  created_at_posix: s.or(s.str(), s.num()),
  user_role: UserRole,
  phone_number: s.maybe(s.str()),
})
export type UserAccountRow = s.Infer<typeof UserAccountRow>

const toAccount = ({ userAccount }: { userAccount: UserAccountRow }): Result<string, UserAccount> => {
  const userId = Result.unwrapOr(UserId.parse(userAccount.id), null)

  if (!userId) {
    return Err('Invalid account. Missing userId.')
  }

  const account: UserAccount = {
    userId,
    role: userAccount.user_role,
    createdAt: Posix.init(userAccount.created_at_posix),
    phoneNumber: Result.unwrapOr(PhoneNumber.fromString(userAccount.phone_number), null),
  }

  return Ok(account)
}

export type Config = {
  t: 'sql'
  dbConnSql: SqlDb
}

export const UserAccountDb = ({ dbConnSql }: Config): IUserAccountDb => {
  return {
    async findOneByUserId(input) {
      if (!UserId.is(input.userId)) {
        return Ok(null)
      }

      const queried = await dbConnSql.query({
        schema: UserAccountRow,
        sql: `
        SELECT
					id,
					created_at_posix,
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

      const account = toAccount({
        userAccount: row,
      })

      return account
    },

    async findOneByPhoneNumber(input) {
      const queried = await dbConnSql.query({
        schema: UserAccountRow,
        sql: `
				SELECT
					id,
					created_at_posix,
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

      const account = toAccount({
        userAccount: row,
      })

      return account
    },
    async insert(input) {
      const row = {
        created_at_posix: input.createdAt,
        id: input.userId,
        user_role: input.role,
        phone_number: input.phoneNumber ? PhoneNumber.toString(input.phoneNumber) : null,
      }
      const inserted = await dbConnSql.query({
        schema: s.unknown,
        sql: `
        INSERT INTO user_account (
					phone_number,
					user_role,
					id,         
					created_at_posix
				)
				VALUES (
					:phone_number,
					:user_role,
					:id,
					:created_at_posix
				)`,
        vars: row,
      })
      return Result.mapOk(inserted, () => null)
    },
  }
}
