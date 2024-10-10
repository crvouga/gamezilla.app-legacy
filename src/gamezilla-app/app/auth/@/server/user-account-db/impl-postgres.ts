import { Err, Ok, PhoneNumber, Posix, Result, isErr } from 'gamezilla-app/@/core'
import { p } from 'gamezilla-app/@/core/parser'
import { UserId, UserRole } from 'gamezilla-app/app/@/data'
import type { UserAccount } from 'gamezilla-app/app/@/data/account'
import type { IDbConnSql } from 'gamezilla-app/app/@/server/db-conn-sql'
import type { IUserAccountDb } from './inteface'

export const UserAccountRow = p.obj({
  user_id: p.str,
  created_at_posix: p.or(p.str, p.num),
  user_role: UserRole,
  phone_number: p.maybe(p.str)
})
export type UserAccountRow = p.Infer<typeof UserAccountRow>

const toAccount = ({ userAccount }: { userAccount: UserAccountRow }): Result<string, UserAccount> => {
  const userId = Result.unwrapOr(UserId.parse(userAccount.user_id), null)

  if (!userId) {
    return Err('Invalid account. Missing userId.')
  }

  const account: UserAccount = {
    userId,
    role: userAccount.user_role,
    createdAt: Posix.init(userAccount.created_at_posix),
    phoneNumber: Result.unwrapOr(PhoneNumber.fromString(userAccount.phone_number), null)
  }

  return Ok(account)
}

export type Config = {
  t: 'postgres'
  dbConnSql: IDbConnSql
}

export const UserAccountDb = ({ dbConnSql }: Config): IUserAccountDb => {
  return {
    async findOneByUserId(input) {
      const queried = await dbConnSql.query(
        UserAccountRow,
        `SELECT
					user_id,
					created_at_posix,
					user_role,
					phone_number
				FROM
					user_account
				WHERE
					user_id = :user_id
				`,
        {
          user_id: input.userId
        }
      )

      if (isErr(queried)) {
        return queried
      }

      const row = queried.value[0] ?? null

      if (!row) {
        return Ok(null)
      }

      const account = toAccount({
        userAccount: row
      })

      return account
    },

    async findOneByPhoneNumber(input) {
      const queried = await dbConnSql.query(
        UserAccountRow,
        `
				SELECT
					user_id,
					created_at_posix,
					user_role,
					phone_number
				FROM
					user_account
				WHERE
					phone_number = :phone_number
				`,
        {
          phone_number: PhoneNumber.toString(input.phoneNumber)
        }
      )

      if (isErr(queried)) {
        return queried
      }

      const row = queried.value[0] ?? null

      if (!row) {
        return Ok(null)
      }

      const account = toAccount({
        userAccount: row
      })

      return account
    },
    async insert(input) {
      const row = {
        created_at_posix: input.account.createdAt,
        user_id: input.account.userId,
        user_role: input.account.role,
        phone_number: input.account.phoneNumber ? PhoneNumber.toString(input.account.phoneNumber) : null
      }
      const inserted = await dbConnSql.query(
        p.unknown,
        `INSERT INTO user_account (
					phone_number,
					user_role,
					user_id,         
					created_at_posix
				)
				VALUES (
					:phone_number,
					:user_role,
					:user_id,
					:created_at_posix
				)`,
        row
      )
      return Result.mapOk(inserted, () => null)
    }
  }
}
