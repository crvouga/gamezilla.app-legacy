import { Result, isErr } from '~/@/result'
import { p } from '~/@/parser'
import { Sql } from '~/@/sql'
import type { IDbConnSql } from '~/@/db-conn-sql'
import { VerificationId } from '../../verification/verification-id'
import { VerificationAttemptId } from '../verification-attempt-id'
import type { IVerificationAttemptDb, WhereClause } from './verification-attempt-db'
import type { VerificationAttempt } from '../verification-attempt'
import { Hash } from '~/@/hashing'
import { Posix } from '~/@/time/posix'

export const Row = p.obj({
  id: VerificationAttemptId,
  verification_id: VerificationId,
  inputted_code_hash: p.json,
  created_at_posix: p.or(p.str, p.num),
})
type Row = p.Infer<typeof Row>

export const VerificationAttemptDbPostgres = (deps: { dbConnSql: IDbConnSql }): IVerificationAttemptDb => {
  deps
  return {
    async insert(input) {
      const query = `
				INSERT INTO auth_sms_verification_attempt (
					id,
					verification_id,
					inputted_code_hash,
					created_at_posix
				) VALUES (
					:id,
					:verification_id,
					:inputted_code_hash,
					:created_at_posix
				)		
			`
      const vars: Sql.Vars = {
        id: input.verificationAttemptId,
        verification_id: input.verificationId,
        inputted_code_hash: Sql.json(input.codeHash),
        created_at_posix: input.createdAt,
      }
      const queried = await deps.dbConnSql.query(p.unknown, query, vars)
      return Result.mapOk(queried, () => null)
    },
    async find(input) {
      const where = toSqlWhere(input.where)

      const query = `
				SELECT
					id,
					verification_id,
					inputted_code_hash,
					created_at_posix
				FROM auth_sms_verification_attempt
				${where.str}
				ORDER BY created_at_posix DESC
			`

      const queried = await deps.dbConnSql.query(Row, query, where.vars)

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
      createdAt: Posix.init(row.created_at_posix),
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
