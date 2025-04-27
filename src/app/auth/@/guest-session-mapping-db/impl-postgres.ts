import { Ok, isErr } from '~/@/result'
import { IGuestSessionMappingDb } from './interface'
import { SessionId } from '~/@/wire/session-id'
import { UserId } from '~/app/@/data/user-id'
import { p } from '~/@/parser'
import { IDbConnSql } from '~/@/db-conn-sql'
import { Posix } from '~/@/time/posix'

export const Row = p.obj({
  id: UserId,
  session_id: SessionId,
  created_at_posix: p.or(p.str, p.num),
})

export type Config = {
  t: 'postgres'
  dbConnSql: IDbConnSql
}

export const GuestSessionMappingDb = (config: Config): IGuestSessionMappingDb => {
  return {
    async findUserIdBySessionId(sessionId) {
      const query = `
				SELECT id
				FROM user_guest_session_mapping
				WHERE session_id = :session_id
				ORDER BY created_at_posix DESC
			`
      const vars = {
        session_id: sessionId,
      }
      const queried = await config.dbConnSql.query({
        parser: p.obj({
          id: UserId,
        }),
        sql: query,
        vars: vars,
      })

      if (isErr(queried)) {
        return queried
      }

      const userId = queried.value[0]?.id ?? null

      return Ok(userId)
    },
    async insert(input) {
      const query = `
				INSERT INTO user_guest_session_mapping (id, session_id, created_at_posix)
				VALUES (:id, :session_id, :created_at_posix)
			`
      const vars = {
        id: input.guestUserId,
        session_id: input.sessionId,
        created_at_posix: Posix.now(),
      }
      const inserted = await config.dbConnSql.query({
        parser: p.unknown,
        sql: query,
        vars: vars,
      })
      if (isErr(inserted)) {
        return inserted
      }
      return Ok(null)
    },
  }
}
