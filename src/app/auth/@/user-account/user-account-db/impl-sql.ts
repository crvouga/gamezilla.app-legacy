import type { IDbConnSql } from '~/@/db-conn-sql'
import { p } from '~/@/parser'
import { PhoneNumber } from '~/@/phone-number'
import { Err, Ok, Result, isErr } from '~/@/result'
import { Posix } from '~/@/time/posix'
import type { UserAccount } from '~/app/@/data/account'
import { UserId } from '~/app/@/data/user-id'
import { UserRole } from '~/app/@/data/user-role'
import type { IUserAccountDb } from './interface'

export const UserAccountRow = p.obj({
  id: p.str,
  created_at_posix: p.or(p.str, p.num),
  user_role: UserRole,
  phone_number: p.maybe(p.str),
})
export type UserAccountRow = p.Infer<typeof UserAccountRow>

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
  dbConnSql: IDbConnSql
}

export const UserAccountDb = ({ dbConnSql }: Config): IUserAccountDb => {
  return {
    async findOneByUserId(input) {
      if (!UserId.is(input.userId)) {
        return Ok(null)
      }

      const queried = await dbConnSql.query({
        parser: UserAccountRow,
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
        parser: UserAccountRow,
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
        created_at_posix: input.account.createdAt,
        id: input.account.userId,
        user_role: input.account.role,
        phone_number: input.account.phoneNumber ? PhoneNumber.toString(input.account.phoneNumber) : null,
      }
      const inserted = await dbConnSql.query({
        parser: p.unknown,
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
