import { Result, isErr } from '~/@/result'
import { s } from '~/@/schema'
import { Sql } from '~/@/sql'
import type { ISqlDb } from '~/@/sql-db/interface'
import { VerificationId } from '../../verification/verification-id'
import { VerificationAttemptId } from '../verification-attempt-id'
import type { IVerificationAttemptDb, WhereClause } from './interface'
import type { VerificationAttempt } from '../verification-attempt'
import { Hash } from '~/@/hashing'
import { UnixMs } from '~/@/time/unix-ms'

export const Row = s.obj({
  id: VerificationAttemptId,
  verification_id: VerificationId,
  inputted_code_hash: s.json,
  created_at_unix_ms: s.or(s.str(), s.num()),
})
type Row = s.Infer<typeof Row>

export const VerificationAttemptDbSqlDb = (deps: { sqlDb: ISqlDb }): IVerificationAttemptDb => {
  deps
  return {
    async insert(input) {
      const query = `
				INSERT INTO auth_sms_verification_attempt (
					id,
					verification_id,
					inputted_code_hash,
					created_at_unix_ms
				) VALUES (
					:id,
					:verification_id,
					:inputted_code_hash,
					:created_at_unix_ms
				)		
			`
      const vars: Sql.Vars = {
        id: input.verificationAttemptId,
        verification_id: input.verificationId,
        inputted_code_hash: Sql.json(input.codeHash),
        created_at_unix_ms: input.createdAt,
      }
      const queried = await deps.sqlDb.query({
        schema: s.unknown,
        sql: query,
        vars: vars,
      })
      return Result.mapOk(queried, () => null)
    },
    async find(input) {
      const where = toSqlWhere(input.where)

      const query = `
				SELECT
					id,
					verification_id,
					inputted_code_hash,
					created_at_unix_ms
				FROM auth_sms_verification_attempt
				${where.str}
				ORDER BY created_at_unix_ms DESC
			`

      const queried = await deps.sqlDb.query({
        schema: Row,
        sql: query,
        vars: where.vars,
      })

      return Result.mapOk(queried, (rows) => rows.flatMap(rowToVerificationAttempt))
    },
  }
}

const rowToVerificationAttempt = (row: Row): VerificationAttempt[] => {
  const codeHash = Hash.parse(row.inputted_code_hash)
  if (isErr(codeHash)) {
    return []
  }
  return [
    {
      verificationAttemptId: row.id,
      verificationId: row.verification_id,
      codeHash: codeHash.value,
      createdAt: UnixMs.init(row.created_at_unix_ms),
    },
  ]
}

const toSqlWhere = (where: WhereClause) => {
  const vars: Sql.Vars = {}
  const clauses: string[] = []

  if (where.verificationId?.['=']) {
    clauses.push('verification_id = :eq_verification_id')
    vars['eq_verification_id'] = where.verificationId['=']
  }

  const str = clauses.length > 0 ? `WHERE ${clauses.join(' AND ')}` : ''

  return {
    str,
    vars,
  }
}
