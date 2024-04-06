import { SpaceId, UserId } from "gamezilla-app/@CHILD/app/@SHARED/data"
import { IDbConnKv } from "gamezilla-app/@CHILD/app/@SHARED/server/db-conn-kv"
import { Err, Ok, Result, isErr } from "gamezilla-app/@SHARED/core"
import * as Space from "../space"
import { ISpacesDb } from "./space-db"

export type Deps = {
  dbConnKv: IDbConnKv
}

export const SpacesDb = (deps: Deps): ISpacesDb => {
  const spacesBySpaceId = IDbConnKv.instance<SpaceId, Space.Model>(
    deps.dbConnKv,
    ["spaces", "space-by-id"],
    Space.Model,
  )
  const indexSpaceIdByUserId = IDbConnKv.instance<UserId, SpaceId>(
    deps.dbConnKv,
    ["spaces", "space-id-by-user-id"],
    SpaceId,
  )

  return {
    async get(spaceId) {
      if (!spaceId) {
        return Ok(null)
      }

      const got = await spacesBySpaceId.get(spaceId)

      if (isErr(got)) {
        return got
      }

      return Ok(got.value)
    },

    async upsert(space) {
      const spaceId = Space.toSpaceId(space)

      if (!spaceId) {
        return Err("Invalid space. Failed to derive spaceId")
      }

      const entries = Space.toUserIds(space).map(
        (userId): [UserId, SpaceId] => [userId, spaceId],
      )

      const results = [
        await spacesBySpaceId.set(spaceId, space),
        await indexSpaceIdByUserId.setMany(entries),
      ]

      return Result.mapOk(Result.combine(results), () => null)
    },

    async list(_input) {
      return Ok([])
    },
  }
}
