import { Ok, PhoneNumber, Posix, Result, isErr } from '@/core'
import { p } from '@/core/parser'
import { Hash } from '@/hashing'
import { Sql } from '@/sql'
import { IDbConnSql } from 'gamezilla-app/app/@/server/db-conn-sql'
import { Verification } from '../verification'
import { VerificationId } from '../verification-id'
import type { IVerificationDb, OrderClause, WhereClause } from './interface'

export const Row = p.obj({
  verification_id: VerificationId,
  code_hash: p.maybe(p.json),
  phone_number: p.str,
  created_at_posix: p.str,
  expires_at_posix: p.str,
  verified_at_posix: p.maybe(p.str)
})
type Row = p.Infer<typeof Row>

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
        ...order.vars
      }
      const queried = await config.dbConnSql.query(Row, query, vars)

      if (isErr(queried)) {
        return queried
      }

      const queryCount = `
				SELECT COUNT(*) FROM auth_sms_verification
				${where.str}
			`
      const queriedCount = await config.dbConnSql.query(
        p.obj({
          count: p.str
        }),
        queryCount,
        vars
      )

      if (isErr(queriedCount)) {
        return queriedCount
      }

      const total = parseInt(queriedCount.value[0]?.count ?? '0') ?? 0

      const items = queried.value.flatMap(rowToVerification)

      return Ok({
        items,
        limit: input.limit ?? Infinity,
        offset: input.offset ?? 0,
        total
      })
    },
    async put(verification) {
      const query = `
				INSERT INTO auth_sms_verification (
					verification_id,
					phone_number,
					created_at_posix,
					expires_at_posix,
					code_hash,
					verified_at_posix
				) VALUES (
					:verification_id,
					:phone_number,
					:created_at_posix,
					:expires_at_posix,
					:code_hash,
					:verified_at_posix
				) ON CONFLICT (verification_id) DO UPDATE SET
					phone_number = :phone_number,
					created_at_posix = :created_at_posix,
					expires_at_posix = :expires_at_posix,
					code_hash = :code_hash,
					verified_at_posix = :verified_at_posix
			`

      const vars = {
        verification_id: verification.verificationId,
        phone_number: PhoneNumber.toString(verification.phoneNumber),
        created_at_posix: verification.createdAt,
        expires_at_posix: verification.expiresAt,
        code_hash: Sql.json(verification.codeHash),
        verified_at_posix: verification.verifiedAt
      }
      const queried = await config.dbConnSql.query(p.unknown, query, vars)

      return Result.mapOk(queried, () => null)
    }
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
      verificationId: row.verification_id,
      codeHash,
      phoneNumber,
      createdAt: Posix.init(row.created_at_posix),
      expiresAt: Posix.init(row.expires_at_posix),
      verifiedAt: row.verified_at_posix ? Posix.init(row.verified_at_posix) : null
    }
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
    vars
  }
}

const toSqlWhere = (where?: WhereClause) => {
  const vars: Record<string, any> = {}
  const clauses: string[] = []

  if (where?.verificationId?.['=']) {
    clauses.push(`verification_id = :verification_id`)
    vars['verification_id'] = where?.verificationId['=']
  }

  if (where?.phoneNumber?.['=']) {
    clauses.push(`phone_number = :phone_number`)
    vars['phone_number'] = PhoneNumber.toString(where?.phoneNumber['='])
  }

  if (where?.createdAt?.['<=']) {
    clauses.push(`:lte_created_at_posix >= created_at_posix `)
    vars['lte_created_at_posix'] = where?.createdAt['<=']
  }

  if (where?.createdAt?.['>=']) {
    clauses.push(`created_at_posix >= :gte_created_at_posix`)
    vars['gte_created_at_posix'] = where?.createdAt['>=']
  }

  const str = clauses.length > 0 ? `WHERE ${clauses.join(' AND ')}` : ''

  return {
    str,
    vars
  }
}
