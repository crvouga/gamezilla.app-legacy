import type { IDbConnSql } from '~/@/db-conn-sql'
import { Err, Ok, Result, isErr } from '~/@/result'
import { p } from '~/@/parser'
import type { ProfileCore } from '../types'
import type { ProfileDb } from './profile-db'
import { UserId } from '~/app/@/data/user-id'
import { Username } from '~/app/@/data/username'
import { ProfileAvatar } from '~/app/@/data/profile-avatar'

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

  const avatarUrl = ProfileAvatar.toUrl({
    seed: avatarSeed,
    style: avatarStyle,
  })

  return Ok({
    userId: row.id,
    avatarUrl: avatarUrl,
    username: row.username,
    avatarSeed: avatarSeed,
    avatarStyle: avatarStyle,
  })
}

export const createProfileDb = ({ dbConn }: { dbConn: IDbConnSql }): ProfileDb => {
  return {
    findOneByUserId: async (userId) => {
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

      const queried = await dbConn.query({
        parser: ProfileRow,
        rawSql: sql,
        variables: {
          id: userId,
        },
      })

      if (isErr(queried)) {
        return queried
      }

      const parsed = Result.combine(queried.value.map(fromProfileRow))

      if (isErr(parsed)) {
        return parsed
      }

      return Ok(parsed.value)
    },
    insertOne: async (profile) => {
      const rowNew: ProfileRow = {
        id: profile.userId,
        username: profile.username,
        avatar_seed: profile.avatarSeed,
        avatar_style: profile.avatarStyle,
      }

      const inserted = await dbConn.query({
        parser: ProfileRow,
        rawSql: `
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
        `,
        variables: rowNew,
      })

      if (isErr(inserted)) {
        return inserted
      }

      return Ok(null)
    },
  }
}
