import { KeyValueDb, type IKeyValueDb } from '~/@/key-value-db'
import { p } from '~/@/parser'
import { Ok, unwrapOr } from '~/@/result'
import { Posix } from '~/@/time/posix'
import { SessionId } from '~/@/wire/session-id'
import { UserId } from '~/app/@/data/user-id'
import { UserSession } from '../user-session'
import { UserSessionId } from '../user-session-id'
import type { IUserSessionDb } from './interface'

const Row = p.obj({
  user_session_id: UserSessionId,
  session_id: SessionId,
  user_id: UserId,
  created_at_posix: Posix,
  ended_at_posix: p.maybe(Posix),
})

export type Row = p.Infer<typeof Row>

const rowToUserSession = (row: Row): UserSession => ({
  userSessionId: row.user_session_id,
  sessionId: row.session_id,
  userId: row.user_id,
  createdAt: row.created_at_posix,
  endedAt: row.ended_at_posix ?? null,
})

const userSessionToRow = (userSession: UserSession): Row => ({
  user_session_id: userSession.userSessionId,
  session_id: userSession.sessionId,
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
    parser: Row,
  })
  const ALL_IDS = 'all-ids'
  const allIds = KeyValueDb.withNamespace({
    keyValueDb: config.keyValueDb,
    namespace: ['user-session', ALL_IDS],
    parser: p.arr(p.str),
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
      return Ok(got.map((row) => row.session_id))
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
      const filtered = all.filter(
        (row) =>
          (input.where.userId ? input.where.userId.equals === row.user_id : true) &&
          (input.where.sessionId ? input.where.sessionId.equals === row.session_id : true),
      )
      const sliced = filtered.slice(input.pagination.offset, input.pagination.offset + input.pagination.limit)
      return Ok({
        items: sliced.map(rowToUserSession),
        total: filtered.length,
        limit: input.pagination.limit,
        offset: input.pagination.offset,
      })
    },
  }
}
