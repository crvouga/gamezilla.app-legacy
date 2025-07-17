import { pipe } from '~/@/function/pipe'
import { Ok, Result, isErr } from '~/@/result'
import { s } from '~/@/schema'
import { ParseError } from '~/@/schema/schema/parse-error'
import { ISqlDb } from '~/@/sql-db'
import { ISqlDbMigrationPolicy } from '~/@/sql-db-migration-policy'
import { UnixMs } from '~/@/time/unix-ms'
import { ClientSessionId } from '~/@/wire/client-session-id'
import { SessionId } from '~/@/wire/session-id'
import { UserId } from '~/app/@/data/user-id'
import { GuestSessionMapping } from '../guest-session-mapping'
import { GuestSessionMappingId } from '../guest-session-mapping-id'
import { IGuestSessionMappingDb } from './interface'

export const Row = s.obj({
  id: GuestSessionMappingId,
  guest_user_id: UserId,
  session_id: s.maybe(SessionId),
  client_session_id: ClientSessionId,
  created_at_unix_ms: s.or(s.str(), s.num()),
})

export type Row = s.Infer<typeof Row>

const rowToEntity = (row: Row): Result<string, GuestSessionMapping> => {
  return Ok({
    id: row.id,
    sessionId: row.session_id,
    clientSessionId: row.client_session_id,
    guestUserId: row.guest_user_id,
  })
}

export type Config = {
  t: 'sql'
  sqlDb: ISqlDb
  migrationPolicy: ISqlDbMigrationPolicy
}

GuestSessionMapping.fromUnknownRegister((data) => {
  return pipe(
    data,
    Row.parse,
    (x) => Result.mapErr(x, ParseError.toString),
    (x) => Result.flatMapOk(x, rowToEntity),
  )
})

const UP: string[] = [
  `
  CREATE TABLE IF NOT EXISTS user_guest_session_mapping (
    id text NOT NULL PRIMARY KEY,
    guest_user_id text NOT NULL,
    session_id text,
    client_session_id text NOT NULL,
    created_at_unix_ms bigint NOT NULL
  );
  `,
]

const DOWN: string[] = [
  `
  DROP TABLE IF EXISTS user_guest_session_mapping;
  `,
]

export const GuestSessionMappingDb = (config: Config): IGuestSessionMappingDb => {
  config.migrationPolicy.execute({
    sqlDb: config.sqlDb,
    up: UP,
    down: DOWN,
  })

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

    async upsert(input) {
      const existing = await this.findUserIdByClientSessionId(input.clientSessionId)

      if (isErr(existing)) {
        return existing
      }

      if (existing.value) {
        const updated = await config.sqlDb.query({
          schema: s.unknown,
          sql: `
          UPDATE user_guest_session_mapping SET guest_user_id = :guest_user_id, session_id = :session_id, created_at_unix_ms = :created_at_unix_ms WHERE client_session_id = :client_session_id
          `,
          vars: {
            guest_user_id: input.guestUserId,
            session_id: input.sessionId,
            created_at_unix_ms: UnixMs.now(),
            client_session_id: input.clientSessionId,
          },
        })

        return Result.mapOk(updated, () => null)
      }

      const inserted = await config.sqlDb.query({
        schema: s.unknown,
        sql: `
				INSERT INTO user_guest_session_mapping (id, guest_user_id, client_session_id, session_id, created_at_unix_ms)
        VALUES (:id, :guest_user_id, :client_session_id, :session_id, :created_at_unix_ms)
			`,
        vars: {
          id: input.id,
          guest_user_id: input.guestUserId,
          client_session_id: input.clientSessionId,
          session_id: input.sessionId,
          created_at_unix_ms: UnixMs.now(),
        },
      })
      if (isErr(inserted)) {
        return inserted
      }
      return Ok(null)
    },
  }
}
