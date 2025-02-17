import type { IDbConnSql } from '~/@/db-conn-sql'
import { Err, Ok, Result, isErr } from '~/@/result'
import { p } from '~/@/parser'
import type { ProfileCore } from '../types'
import type { IProfileDb } from './interface'
import { UserId } from '~/app/@/data/user-id'
import { Username } from '~/app/@/data/username'
import { ProfileAvatar } from '~/app/@/data/profile-avatar'
import { ILogger } from '~/@/logger'

const ProfileRow = p.obj({
  id: p.str,
  username: p.str,
  avatar_seed: p.maybe(p.str),
  avatar_style: p.maybe(p.str),
})

type ProfileRow = p.Infer<typeof ProfileRow>

const fromProfileRow = (row: ProfileRow): Result<string, ProfileCore> => {
  if (!UserId.is(row.id)) {
    return Err('invalid user_id')
  }

  if (!Username.is(row.username)) {
    return Err('invalid username')
  }

  const avatarSeed = row.avatar_seed ? ProfileAvatar.toSeed(row.avatar_seed) : ProfileAvatar.toSeed(row.username)

  const avatarStyle = row.avatar_style
    ? ProfileAvatar.toStyle(row.avatar_style)
    : ProfileAvatar.STYLES['big-ears-neutral']

  const profile: ProfileCore = {
    userId: row.id,
    username: row.username,
    avatarSeed: avatarSeed,
    avatarStyle: avatarStyle,
  }

  return Ok(profile)
}

export type Config = {
  t: 'db-conn-sql'
  dbConnSql: IDbConnSql
  logger: ILogger
}

export const ProfileDb = (config: Config): IProfileDb => {
  return {
    async findByUserId(userId) {
      const sql = `
        SELECT
          id,
          username,
          avatar_seed,
          avatar_style
        FROM
          user_profile
        WHERE
          id = :id
      `

      const queried = await config.dbConnSql.query({
        parser: ProfileRow,
        sql: sql,
        vars: {
          id: userId,
        },
      })

      if (isErr(queried)) return queried

      const parsed = Result.combine(queried.value.map(fromProfileRow))

      if (isErr(parsed)) return parsed

      return Ok(parsed.value)
    },
    async put(profile) {
      const rowNew: ProfileRow = {
        id: profile.userId,
        username: profile.username,
        avatar_seed: profile.avatarSeed,
        avatar_style: profile.avatarStyle,
      }

      const upserted = await config.dbConnSql.query({
        parser: ProfileRow,
        sql: `
        INSERT INTO user_profile (
          id,
          username,
          avatar_seed,
          avatar_style
        )
        VALUES (
          :id,
          :username,
          :avatar_seed,
          :avatar_style
        )
        ON CONFLICT (id) DO UPDATE SET
          username = EXCLUDED.username,
          avatar_seed = EXCLUDED.avatar_seed,
          avatar_style = EXCLUDED.avatar_style
        `,
        vars: rowNew,
      })

      if (isErr(upserted)) return upserted

      return Ok(null)
    },
  }
}
