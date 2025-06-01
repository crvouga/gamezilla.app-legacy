import { KeyValueDb, type IKeyValueDb } from '~/@/key-value-db'
import { s } from '~/@/schema'
import { Ok, unwrapOr } from '~/@/result'
import { Sub } from '~/@/sub'
import { Posix } from '~/@/time/posix'
import { ClientSessionId } from '~/@/wire/client-session-id'
import { SessionId } from '~/@/wire/session-id'
import { UserId } from '~/app/@/data/user-id'
import { UserSession } from '../user-session'
import { UserSessionId } from '../user-session-id'
import * as ImplInMemory from './impl-in-memory'
import type { IUserSessionDb } from './interface'

const Row = s.obj({
  user_session_id: UserSessionId,
  session_id: s.maybe(SessionId),
  client_session_id: ClientSessionId,
  user_id: UserId,
  created_at_posix: Posix,
  ended_at_posix: s.maybe(Posix),
})

export type Row = s.Infer<typeof Row>

const rowToUserSession = (row: Row): UserSession => ({
  userSessionId: row.user_session_id,
  sessionId: row.session_id ?? null,
  userId: row.user_id,
  createdAt: row.created_at_posix,
  endedAt: row.ended_at_posix ?? null,
  clientSessionId: row.client_session_id,
})

const userSessionToRow = (userSession: UserSession): Row => ({
  user_session_id: userSession.userSessionId,
  session_id: userSession.sessionId,
  client_session_id: userSession.clientSessionId,
  user_id: userSession.userId,
  created_at_posix: userSession.createdAt,
  ended_at_posix: userSession.endedAt,
})

export type Config = {
  t: 'key-value-db'
  keyValueDb: IKeyValueDb
}

export const UserSessionDb = (config: Config): IUserSessionDb => {
  const userSessions = KeyValueDb.withNamespace({
    keyValueDb: config.keyValueDb,
    namespace: ['user-session'],
    schema: Row,
  })
  const ALL_IDS = 'all-ids'
  const allIds = KeyValueDb.withNamespace({
    keyValueDb: config.keyValueDb,
    namespace: ['user-session', ALL_IDS],
    schema: s.arr(s.str()),
  })

  const getAll = async (): Promise<Row[]> => {
    const gotAllIds = unwrapOr(await allIds.get(ALL_IDS), []) ?? []
    const gotAll = unwrapOr(await userSessions.getMany(gotAllIds), [])
    return gotAll
  }

  return {
    async findSessionIdsByUserId(userId: UserId) {
      const all = await getAll()
      const got = all.filter((row) => row.user_id === userId)
      return Ok(got.flatMap((row) => (row.session_id ? [row.session_id] : [])))
    },

    async findUserIdBySessionId(sessionId: SessionId) {
      const all = await getAll()
      const got = all.find((row) => row.session_id === sessionId)
      return Ok(got?.user_id ?? null)
    },

    async insert(input) {
      const all = await getAll()
      all.push(userSessionToRow(input))
      await allIds.set(
        ALL_IDS,
        all.map((row) => row.user_session_id),
      )
      await userSessions.set(input.userSessionId, userSessionToRow(input))
      return Ok(null)
    },

    async zapByUserId(_userId) {
      const all = await getAll()
      const filtered = all.filter((row) => row.user_id !== _userId)
      await allIds.set(
        ALL_IDS,
        filtered.map((row) => row.user_session_id),
      )
      for (const row of all) {
        await userSessions.zap(row.user_session_id)
      }
      return Ok(null)
    },

    async zapBySessionId(_sessionId) {
      const all = await getAll()
      const filtered = all.filter((row) => row.session_id !== _sessionId)
      await allIds.set(
        ALL_IDS,
        filtered.map((row) => row.user_session_id),
      )
      for (const row of all) {
        await userSessions.zap(row.user_session_id)
      }
      return Ok(null)
    },

    async query(input) {
      const all = await getAll()
      const db = ImplInMemory.UserSessionDb({
        t: 'in-memory',
        simulateLatency: () => Promise.resolve(),
      })
      for (const row of all) {
        await db.insert(rowToUserSession(row))
      }
      return db.query(input)
    },
    async zapByClientSessionId(clientSessionId) {
      const all = await getAll()
      const filtered = all.filter((row) => row.client_session_id !== clientSessionId)
      await allIds.set(
        ALL_IDS,
        filtered.map((row) => row.user_session_id),
      )
      for (const row of all) {
        await userSessions.zap(row.user_session_id)
      }
      return Ok(null)
    },

    sub(_input) {
      return Sub.none()
    },
  }
}
