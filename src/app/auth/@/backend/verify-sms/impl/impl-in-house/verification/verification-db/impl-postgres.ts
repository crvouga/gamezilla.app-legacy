import { Ok, Result, isErr } from '~/@/result'
import { s } from '~/@/schema'
import { Hash } from '~/@/hashing'
import { Sql } from '~/@/sql'
import { IDbConnSql } from '~/@/db-conn-sql'
import { Verification } from '../verification'
import { VerificationId } from '../verification-id'
import type { IVerificationDb, OrderClause, WhereClause } from './interface'
import { Posix } from '~/@/time/posix'
import { PhoneNumber } from '~/@/phone-number'

export const Row = s.obj({
  id: VerificationId,
  code_hash: s.maybe(s.json),
  phone_number: s.str,
  created_at_posix: s.str,
  expires_at_posix: s.str,
  verified_at_posix: s.maybe(s.str),
})
type Row = s.Infer<typeof Row>

export type Config = {
  t: 'postgres'
  dbConnSql: IDbConnSql
}

export const VerificationDb = (config: Config): IVerificationDb => {
  return {
    async find(input) {
      const where = toSqlWhere(input.where)
      const order = toSqlOrder(input.order)
      const pagination = Sql.pagination(input)
      const query = `
				SELECT * FROM auth_sms_verification
				${where.str}
				${order.str}
				${pagination.str}
			`
      const vars = {
        ...where.vars,
        ...pagination.vars,
        ...order.vars,
      }
      const queried = await config.dbConnSql.query({
        schema: Row,
        sql: query,
        vars: vars,
      })

      if (isErr(queried)) {
        return queried
      }

      const queryCount = `
				SELECT COUNT(*) FROM auth_sms_verification
				${where.str}
			`
      const queriedCount = await config.dbConnSql.query({
        schema: s.obj({
          count: s.str,
        }),
        sql: queryCount,
        vars: vars,
      })

      if (isErr(queriedCount)) {
        return queriedCount
      }

      const total = parseInt(queriedCount.value[0]?.count ?? '0') ?? 0

      const items = queried.value.flatMap(rowToVerification)

      return Ok({
        items,
        limit: input.limit ?? Infinity,
        offset: input.offset ?? 0,
        total,
      })
    },
    async put(verification) {
      const query = `
				INSERT INTO auth_sms_verification (
					id,
					phone_number,
					created_at_posix,
					expires_at_posix,
					code_hash,
					verified_at_posix
				) VALUES (
					:id,
					:phone_number,
					:created_at_posix,
					:expires_at_posix,
					:code_hash,
					:verified_at_posix
				) ON CONFLICT (id) DO UPDATE SET
					phone_number = :phone_number,
					created_at_posix = :created_at_posix,
					expires_at_posix = :expires_at_posix,
					code_hash = :code_hash,
					verified_at_posix = :verified_at_posix
			`

      const vars = {
        id: verification.verificationId,
        phone_number: PhoneNumber.toString(verification.phoneNumber),
        created_at_posix: verification.createdAtPosix,
        expires_at_posix: verification.expiresAtPosix,
        code_hash: Sql.json(verification.codeHash),
        verified_at_posix: verification.verifiedAtPosix,
      }
      const queried = await config.dbConnSql.query({
        schema: s.unknown,
        sql: query,
        vars: vars,
      })

      return Result.mapOk(queried, () => null)
    },
    async zap(verificationId) {
      const query = `DELETE FROM auth_sms_verification WHERE id = :id`
      const vars = {
        id: verificationId,
      }
      const queried = await config.dbConnSql.query({
        schema: s.unknown,
        sql: query,
        vars: vars,
      })

      return Result.mapOk(queried, () => null)
    },
  }
}

const rowToVerification = (row: Row): Verification[] => {
  const phoneNumber = Result.unwrapOr(PhoneNumber.fromString(row.phone_number), null)
  if (!phoneNumber) {
    return []
  }
  const codeHash = Result.unwrapOr(Hash.parse(row.code_hash), null)
  return [
    {
      verificationId: row.id,
      codeHash,
      phoneNumber,
      createdAtPosix: Posix.init(row.created_at_posix),
      expiresAtPosix: Posix.init(row.expires_at_posix),
      verifiedAtPosix: row.verified_at_posix ? Posix.init(row.verified_at_posix) : null,
    },
  ]
}

const toSqlOrder = (order?: OrderClause) => {
  const vars: Record<string, any> = {}
  const clauses: string[] = []

  if (order?.createdAt) {
    const sqlOrder = order.createdAt === 'asc' ? 'ASC' : 'DESC'
    clauses.push(`created_at_posix ${sqlOrder}`)
  }

  const str = clauses.length > 0 ? `ORDER BY ${clauses.join(', ')}` : 'ORDER BY created_at_posix DESC'

  return {
    str,
    vars,
  }
}

const toSqlWhere = (where?: WhereClause) => {
  const vars: Record<string, any> = {}
  const clauses: string[] = []

  if (where?.verificationId?.['=']) {
    clauses.push(`id = :id`)
    vars['id'] = where?.verificationId['=']
  }

  if (where?.phoneNumber?.['=']) {
    clauses.push(`phone_number = :phone_number`)
    vars['phone_number'] = PhoneNumber.toString(where?.phoneNumber['='])
  }

  if (where?.createdAtPosix?.['<=']) {
    clauses.push(`:lte_created_at_posix >= created_at_posix `)
    vars['lte_created_at_posix'] = where?.createdAtPosix['<=']
  }

  if (where?.createdAtPosix?.['>=']) {
    clauses.push(`created_at_posix >= :gte_created_at_posix`)
    vars['gte_created_at_posix'] = where?.createdAtPosix['>=']
  }

  const str = clauses.length > 0 ? `WHERE ${clauses.join(' AND ')}` : ''

  return {
    str,
    vars,
  }
}
