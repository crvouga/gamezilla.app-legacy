import { Ok, Result, isErr } from '~/@/result'
import { s } from '~/@/schema'
import { Hash } from '~/@/hashing'
import { Sql } from '~/@/sql'
import { ISqlDb } from '~/@/sql-db'
import { Verification } from '../verification'
import { VerificationId } from '../verification-id'
import type { IVerificationDb, OrderClause, WhereClause } from './interface'
import { UnixMs } from '~/@/time/posix'
import { PhoneNumber } from '~/@/phone-number'

export const Row = s.obj({
  id: VerificationId,
  code_hash: s.maybe(s.json),
  phone_number: s.str(),
  created_at_unix_ms: s.str(),
  expires_at_unix_ms: s.str(),
  verified_at_unix_ms: s.maybe(s.str()),
})
type Row = s.Infer<typeof Row>

export type Config = {
  t: 'sql-db'
  sqlDb: ISqlDb
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
      const queried = await config.sqlDb.query({
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
      const queriedCount = await config.sqlDb.query({
        schema: s.obj({
          count: s.str(),
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
					created_at_unix_ms,
					expires_at_unix_ms,
					code_hash,
					verified_at_unix_ms
				) VALUES (
					:id,
					:phone_number,
					:created_at_unix_ms,
					:expires_at_unix_ms,
					:code_hash,
					:verified_at_unix_ms
				) ON CONFLICT (id) DO UPDATE SET
					phone_number = :phone_number,
					created_at_unix_ms = :created_at_unix_ms,
					expires_at_unix_ms = :expires_at_unix_ms,
					code_hash = :code_hash,
					verified_at_unix_ms = :verified_at_unix_ms
			`

      const vars = {
        id: verification.verificationId,
        phone_number: PhoneNumber.toString(verification.phoneNumber),
        created_at_unix_ms: verification.createdAtUnixMs,
        expires_at_unix_ms: verification.expiresAtUnixMs,
        code_hash: Sql.json(verification.codeHash),
        verified_at_unix_ms: verification.verifiedAtUnixMs,
      }
      const queried = await config.sqlDb.query({
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
      const queried = await config.sqlDb.query({
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
      createdAtUnixMs: UnixMs.init(row.created_at_unix_ms),
      expiresAtUnixMs: UnixMs.init(row.expires_at_unix_ms),
      verifiedAtUnixMs: row.verified_at_unix_ms ? UnixMs.init(row.verified_at_unix_ms) : null,
    },
  ]
}

const toSqlOrder = (order?: OrderClause) => {
  const vars: Record<string, any> = {}
  const clauses: string[] = []

  if (order?.createdAt) {
    const sqlOrder = order.createdAt === 'asc' ? 'ASC' : 'DESC'
    clauses.push(`created_at_unix_ms ${sqlOrder}`)
  }

  const str = clauses.length > 0 ? `ORDER BY ${clauses.join(', ')}` : 'ORDER BY created_at_unix_ms DESC'

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

  if (where?.createdAtUnixMs?.['<=']) {
    clauses.push(`:lte_created_at_unix_ms >= created_at_unix_ms `)
    vars['lte_created_at_unix_ms'] = where?.createdAtUnixMs['<=']
  }

  if (where?.createdAtUnixMs?.['>=']) {
    clauses.push(`created_at_unix_ms >= :gte_created_at_unix_ms`)
    vars['gte_created_at_unix_ms'] = where?.createdAtUnixMs['>=']
  }

  const str = clauses.length > 0 ? `WHERE ${clauses.join(' AND ')}` : ''

  return {
    str,
    vars,
  }
}
