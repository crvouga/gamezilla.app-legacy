import type { SqlDb } from '~/@/sql-db'
import { ILogger } from '~/@/logger'
import { s } from '~/@/schema'
import { Ok, Result, isErr, unwrapOr } from '~/@/result'
import { Sql } from '~/@/sql'
import { Sub } from '~/@/sub'
import { Posix } from '~/@/time/posix'
import { ProfileAvatar } from '~/app/@/data/profile-avatar'
import { UserId } from '~/app/@/data/user-id'
import { UserProfile } from '~/app/@/data/user-profile'
import { Username } from '~/app/@/data/username'
import type { IUserProfileDb } from './interface'
import { ProfileDbQuery } from './query'

const ProfileRow = s.obj({
  id: UserId,
  username: Username,
  avatar_seed: s.maybe(s.str()),
  avatar_style: s.maybe(s.str()),
  created_at_posix: s.or(s.num(), s.str()),
  updated_at_posix: s.or(s.num(), s.str()),
})

type ProfileRow = s.Infer<typeof ProfileRow>

const fromProfileRow = (row: ProfileRow): Result<string, UserProfile> => {
  const avatarSeed = row.avatar_seed ? ProfileAvatar.toSeed(row.avatar_seed) : ProfileAvatar.toSeed(row.username)

  const avatarStyle = row.avatar_style
    ? ProfileAvatar.toStyle(row.avatar_style)
    : ProfileAvatar.STYLES['big-ears-neutral']

  const profile: UserProfile = {
    id: row.id,
    username: row.username,
    avatarSeed: avatarSeed,
    avatarStyle: avatarStyle,
    createdAt: Posix.init(row.created_at_posix),
    updatedAt: Posix.init(row.updated_at_posix),
  }

  return Ok(profile)
}

export type Config = {
  t: 'sql'
  dbConnSql: SqlDb
  logger: ILogger
}

export const ProfileDb = (config: Config): IUserProfileDb => {
  return {
    async findByUserIds(userIds) {
      const sql = `
        SELECT
          id,
          username,
          avatar_seed,
          avatar_style,
          created_at_posix,
          updated_at_posix
        FROM
          user_profile
        WHERE
          id IN (:id_commas)
      `

      const queried = await config.dbConnSql.query({
        schema: ProfileRow,
        sql: sql,
        vars: {
          id_commas: Sql.commas(userIds),
        },
      })

      if (isErr(queried)) return queried

      const parsed = Result.combine(queried.value.map(fromProfileRow))

      if (isErr(parsed)) return parsed

      return Ok(parsed.value)
    },

    async put(profile) {
      const rowNew: ProfileRow = {
        id: profile.id,
        username: profile.username,
        avatar_seed: profile.avatarSeed,
        avatar_style: profile.avatarStyle,
        created_at_posix: profile.createdAt,
        updated_at_posix: profile.updatedAt,
      }

      const upserted = await config.dbConnSql.query({
        schema: ProfileRow,
        sql: `
        INSERT INTO user_profile (
          id,
          username,
          avatar_seed,
          avatar_style,
          created_at_posix,
          updated_at_posix
        )
        VALUES (
          :id,          
          :username,
          :avatar_seed,
          :avatar_style,
          :created_at_posix,
          :updated_at_posix
        )
        ON CONFLICT (id) DO UPDATE SET
          username = EXCLUDED.username,
          avatar_seed = EXCLUDED.avatar_seed,
          avatar_style = EXCLUDED.avatar_style,
          created_at_posix = EXCLUDED.created_at_posix,
          updated_at_posix = EXCLUDED.updated_at_posix
        `,
        vars: rowNew,
      })

      if (isErr(upserted)) return upserted

      return Ok(null)
    },

    async query(query) {
      const { sql, sqlTotal, vars } = queryToSql(query)
      const queried = await config.dbConnSql.query({
        schema: ProfileRow,
        sql: sql,
        vars: vars,
      })
      const queriedTotal = await config.dbConnSql.query({
        schema: s.obj({ total: s.or(s.num(), s.str()) }),
        sql: sqlTotal,
        vars: vars,
      })

      if (isErr(queried)) return queried
      if (isErr(queriedTotal)) return queriedTotal

      const parsed = Result.combine(queried.value.map(fromProfileRow))
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
      return Sub.map(config.dbConnSql.sub({ schema: ProfileRow, sql: sql, vars: vars }), (rows) =>
        unwrapOr(Result.combine(rows.map(fromProfileRow)), []),
      )
    },
  }
}

const queryToSql = (query: ProfileDbQuery) => {
  const whereClauses = []
  const vars: Sql.Vars = {}

  if (query.whereAnd?.userId?.equals) {
    whereClauses.push('id = :id')
    vars.id = query.whereAnd.userId.equals
  }

  vars.limit = query.pagination.limit
  vars.offset = query.pagination.offset

  const whereClause = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : ''

  const sql = `
        SELECT
          id,
          username,
          avatar_seed,
          avatar_style,
          created_at_posix,
          updated_at_posix
        FROM
          user_profile
        ${whereClause}
        ORDER BY created_at_posix ${query.order.createdAt.toUpperCase() === 'ASC' ? 'ASC' : 'DESC'}
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
