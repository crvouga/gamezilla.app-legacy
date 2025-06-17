import { ILogger } from '~/@/logger'
import { Ok, Result, isErr, unwrapOr } from '~/@/result'
import { s } from '~/@/schema'
import { Sql } from '~/@/sql'
import type { ISqlDb } from '~/@/sql-db'
import { Sub } from '~/@/sub'
import { UnixMs } from '~/@/time/unix-ms'
import { ProfileAvatar } from '~/app/@/data/profile-avatar'
import { UserId } from '~/app/@/data/user-id'
import { UserProfile } from '~/app/@/data/user-profile'
import { UserProfileId } from '~/app/@/data/user-profile-id'
import { Username } from '~/app/@/data/username'
import type { IUserProfileDb } from './interface'
import { ProfileDbQuery } from './interface-query'

const ProfileRow = s.obj({
  id: UserProfileId,
  user_id: UserId,
  username: Username,
  avatar_seed: s.maybe(s.str()),
  avatar_style: s.maybe(s.str()),
  created_at_unix_ms: s.or(s.num(), s.str()),
  updated_at_unix_ms: s.or(s.num(), s.str()),
})

type ProfileRow = s.Infer<typeof ProfileRow>

const rowToEntity = (row: ProfileRow): Result<string, UserProfile> => {
  const avatarSeed = row.avatar_seed ? ProfileAvatar.toSeed(row.avatar_seed) : ProfileAvatar.toSeed(row.username)

  const avatarStyle = row.avatar_style
    ? ProfileAvatar.toStyle(row.avatar_style)
    : ProfileAvatar.STYLES['big-ears-neutral']

  const profile: UserProfile = {
    id: row.id,
    userId: row.user_id,
    username: row.username,
    avatarSeed: avatarSeed,
    avatarStyle: avatarStyle,
    createdAt: UnixMs.init(row.created_at_unix_ms),
    updatedAt: UnixMs.init(row.updated_at_unix_ms),
  }

  return Ok(profile)
}

export type Config = {
  t: 'sql'
  sqlDb: ISqlDb
  logger: ILogger
}

export const ProfileDb = (config: Config): IUserProfileDb => {
  return {
    async findByUserIds(userIds) {
      const sql = `
        SELECT
          id,
          user_id,
          username,
          avatar_seed,
          avatar_style,
          created_at_unix_ms,
          updated_at_unix_ms
        FROM
          user_profile
        WHERE
          user_id IN (:id_commas)
      `

      const queried = await config.sqlDb.query({
        schema: ProfileRow,
        sql: sql,
        vars: {
          id_commas: Sql.commas(userIds),
        },
      })

      if (isErr(queried)) return queried

      const parsed = Result.combine(queried.value.map(rowToEntity))

      if (isErr(parsed)) return parsed

      return Ok(parsed.value)
    },

    async put(profile) {
      const rowNew: ProfileRow = {
        id: profile.id,
        user_id: profile.userId,
        username: profile.username,
        avatar_seed: profile.avatarSeed,
        avatar_style: profile.avatarStyle,
        created_at_unix_ms: profile.createdAt,
        updated_at_unix_ms: profile.updatedAt,
      }

      const upserted = await config.sqlDb.query({
        schema: ProfileRow,
        sql: `
        INSERT INTO user_profile (
          id,
          user_id,
          username,
          avatar_seed,
          avatar_style,
          created_at_unix_ms,
          updated_at_unix_ms
        )
        VALUES (
          :id,
          :user_id,
          :username,
          :avatar_seed,
          :avatar_style,
          :created_at_unix_ms,
          :updated_at_unix_ms
        )
        ON CONFLICT (id) DO UPDATE SET
          user_id = EXCLUDED.user_id,
          username = EXCLUDED.username,
          avatar_seed = EXCLUDED.avatar_seed,
          avatar_style = EXCLUDED.avatar_style,
          created_at_unix_ms = EXCLUDED.created_at_unix_ms,
          updated_at_unix_ms = EXCLUDED.updated_at_unix_ms
        `,
        vars: rowNew,
      })

      if (isErr(upserted)) return upserted

      return Ok(null)
    },

    async query(query) {
      const { sql, sqlTotal, vars } = queryToSql(query)
      const queried = await config.sqlDb.query({
        schema: ProfileRow,
        sql: sql,
        vars: vars,
      })
      const queriedTotal = await config.sqlDb.query({
        schema: s.obj({ total: s.or(s.num(), s.str()) }),
        sql: sqlTotal,
        vars: vars,
      })

      if (isErr(queried)) return queried
      if (isErr(queriedTotal)) return queriedTotal

      const parsed = Result.combine(queried.value.map(rowToEntity))
      if (isErr(parsed)) return parsed

      const total = Number(queriedTotal.value[0]?.total ?? 0)

      return Ok({
        items: parsed.value,
        limit: query.pagination.limit,
        offset: query.pagination.offset,
        total: total,
      })
    },
    sub(query) {
      const { sql, vars } = queryToSql(query)
      return Sub.map(config.sqlDb.sub({ schema: ProfileRow, sql: sql, vars: vars }), (rows) =>
        unwrapOr(Result.combine(rows.map(rowToEntity)), []),
      )
    },
  }
}

const queryToSql = (query: ProfileDbQuery) => {
  const whereClauses = []
  const vars: Sql.Vars = {}

  if (query.whereAnd?.userId?.equals) {
    whereClauses.push('user_id = :user_id')
    vars.user_id = query.whereAnd.userId.equals
  }

  vars.limit = query.pagination.limit
  vars.offset = query.pagination.offset

  const whereClause = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : ''

  const sql = `
        SELECT
          id,
          user_id,
          username,
          avatar_seed,
          avatar_style,
          created_at_unix_ms,
          updated_at_unix_ms
        FROM
          user_profile
        ${whereClause}
        ORDER BY created_at_unix_ms ${query.order.createdAt.toUpperCase() === 'ASC' ? 'ASC' : 'DESC'}
        LIMIT :limit
        OFFSET :offset
      `

  const sqlTotal = `
    SELECT COUNT(*) AS total
    FROM user_profile
    ${whereClause}
  `

  return {
    sql,
    sqlTotal,
    vars,
  }
}
