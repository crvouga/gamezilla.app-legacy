import { ISqlDb } from '~/@/sql-db'
import { s } from '~/@/schema'
import { Ok, isErr } from '~/@/result'
import { UnixMs } from '~/@/time/posix'
import { SessionId } from '~/@/wire/session-id'
import { UserId } from '~/app/@/data/user-id'
import { IGuestSessionMappingDb } from './interface'

export const Row = s.obj({
  id: s.str(),
  guest_user_id: UserId,
  session_id: SessionId,
  created_at_unix_ms: s.or(s.str(), s.num()),
})

export type Config = {
  t: 'sql'
  sqlDb: ISqlDb
}

export const GuestSessionMappingDb = (config: Config): IGuestSessionMappingDb => {
  return {
    async findUserIdBySessionId(sessionId) {
      const query = `
				SELECT guest_user_id
				FROM user_guest_session_mapping
				WHERE session_id = :session_id
				ORDER BY created_at_unix_ms DESC
			`
      const vars = {
        session_id: sessionId,
      }
      const queried = await config.sqlDb.query({
        schema: s.obj({
          guest_user_id: UserId,
        }),
        sql: query,
        vars: vars,
      })

      if (isErr(queried)) {
        return queried
      }

      const userId = queried.value[0]?.guest_user_id ?? null

      return Ok(userId)
    },
    async findUserIdByClientSessionId(clientSessionId) {
      const query = `
				SELECT guest_user_id
				FROM user_guest_session_mapping
				WHERE client_session_id = :client_session_id
			`
      const vars = {
        client_session_id: clientSessionId,
      }
      const queried = await config.sqlDb.query({
        schema: s.obj({
          guest_user_id: UserId,
        }),
        sql: query,
        vars: vars,
      })
      if (isErr(queried)) {
        return queried
      }
      const userId = queried.value[0]?.guest_user_id ?? null
      return Ok(userId)
    },

    async insert(input) {
      const query = `
				INSERT INTO user_guest_session_mapping (id, guest_user_id, client_session_id, session_id, created_at_unix_ms)
        VALUES (:id, :guest_user_id, :client_session_id, :session_id, :created_at_unix_ms)
			`
      const vars = {
        id: input.id,
        guest_user_id: input.guestUserId,
        client_session_id: input.clientSessionId,
        session_id: input.sessionId,
        created_at_unix_ms: UnixMs.now(),
      }
      const inserted = await config.sqlDb.query({
        schema: s.unknown,
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
