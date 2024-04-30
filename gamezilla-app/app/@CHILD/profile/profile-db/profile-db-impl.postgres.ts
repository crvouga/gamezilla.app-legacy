import { ProfileAvatar, UserId, Username } from "gamezilla-app/app/@SHARED/data"
import { IDbConnSql } from "gamezilla-app/app/@SHARED/server/db-conn-sql"
import { Err, Ok, Result, isErr } from "gamezilla-app/@SHARED/core"
import { p } from "gamezilla-app/@SHARED/core/parser"
import { ProfileCore } from "../profile.core"
import { ProfileDb } from "./profile-db"

const ProfileRow = p.obj({
  user_id: p.str,
  username: p.str,
  avatar_seed: p.maybe(p.str),
  avatar_style: p.maybe(p.str),
})

type ProfileRow = p.Infer<typeof ProfileRow>

const fromProfileRow = (row: ProfileRow): Result<string, ProfileCore> => {
  if (!UserId.is(row.user_id)) {
    return Err("invalid user_id")
  }

  if (!Username.is(row.username)) {
    return Err("invalid username")
  }

  const avatarSeed = row.avatar_seed
    ? ProfileAvatar.toSeed(row.avatar_seed)
    : ProfileAvatar.toSeed(row.username)

  const avatarStyle = row.avatar_style
    ? ProfileAvatar.toStyle(row.avatar_style)
    : ProfileAvatar.STYLES["big-ears-neutral"]

  const avatarUrl = ProfileAvatar.toUrl({
    seed: avatarSeed,
    style: avatarStyle,
  })

  return Ok({
    userId: row.user_id,
    avatarUrl: avatarUrl,
    username: row.username,
    avatarSeed: avatarSeed,
    avatarStyle: avatarStyle,
  })
}

export const createProfileDb = ({
  dbConn,
}: {
  dbConn: IDbConnSql
}): ProfileDb => {
  return {
    findOneByUserId: async (userId) => {
      const sql = `
        SELECT
          user_id,
          username,
          avatar_seed,
          avatar_style
        FROM
          user_profile
        WHERE
          user_id = :user_id
      `

      const queried = await dbConn.query(ProfileRow, sql, {
        user_id: userId,
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
        user_id: profile.userId,
        username: profile.username,
        avatar_seed: profile.avatarSeed,
        avatar_style: profile.avatarStyle,
      }

      const inserted = await dbConn.query(
        ProfileRow,
        `
        INSERT INTO user_profile (
          user_id,
          username,
          avatar_seed,
          avatar_style
        )
        VALUES (
          :user_id,
          :username,
          :avatar_seed,
          :avatar_style
        )
        `,
        rowNew,
      )

      if (isErr(inserted)) {
        return inserted
      }

      return Ok(null)
    },
  }
}
