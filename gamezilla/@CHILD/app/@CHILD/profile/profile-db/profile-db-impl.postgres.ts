import {
    ProfileAvatar,
    UserId,
    Username,
} from "gamezilla/@CHILD/app/@SHARED/data"
import { DbConnSql } from "gamezilla/@CHILD/app/@SHARED/server"
import { err, isErr, ok, Result } from "gamezilla/@SHARED/core"
import { Parsing as P } from "gamezilla/@SHARED/parsing"
import { ProfileCore } from "../profile.core"
import { ProfileDb } from "./profile-db"

type ProfileRow = {
    user_id: string
    username: string
    avatar_seed: string | null
    avatar_style: string | null
}

const toProfileRow = (x: unknown): ProfileRow | null => {
    if (
        P.obj(x) &&
        P.has(x, "user_id", P.str) &&
        P.has(x, "username", P.str) &&
        P.has(x, "avatar_seed", P.or(P.nullish, P.str)) &&
        P.has(x, "avatar_style", P.or(P.nullish, P.str))
    ) {
        return {
            ...x,
            avatar_seed: x.avatar_seed ?? null,
            avatar_style: x.avatar_style ?? null,
        }
    }
    return null
}

const fromProfileRow = (row: ProfileRow): Result<string, ProfileCore> => {
    if (!UserId.is(row.user_id)) {
        return err("invalid user_id")
    }

    if (!Username.is(row.username)) {
        return err("invalid username")
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

    return ok({
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
    dbConn: DbConnSql
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

            const queried = await dbConn.query(P.is(toProfileRow), sql, {
                user_id: userId,
            })

            if (isErr(queried)) {
                return queried
            }

            const parsed = Result.combine(queried.value.map(fromProfileRow))

            if (isErr(parsed)) {
                return parsed
            }

            return ok(parsed.value)
        },
        insertOne: async (profile) => {
            const rowNew: ProfileRow = {
                user_id: profile.userId,
                username: profile.username,
                avatar_seed: profile.avatarSeed,
                avatar_style: profile.avatarStyle,
            }

            const inserted = await dbConn.query(
                P.is(toProfileRow),
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

            return ok(null)
        },
    }
}
