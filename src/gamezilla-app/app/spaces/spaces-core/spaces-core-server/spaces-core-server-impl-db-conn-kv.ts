import { Err, Ok, Result, isErr, pipe } from 'gamezilla-app/@/core'
import { p } from 'gamezilla-app/@/core/parser'
import { SpaceId, type UserId } from 'gamezilla-app/app/@/data'
import { DbConnKv, type IDbConnKv } from 'gamezilla-app/app/@/server/db-conn-kv'
import * as SpaceCore from '../space-core'
import type { ISpacesCoreServer } from './spaces-core-server'

export type Config = {
  t: 'db-conn-kv'
  dbConnKv: IDbConnKv
}

export const SpacesCoreServer = (config: Config): ISpacesCoreServer => {
  const spacesBySpaceId = DbConnKv.withNamespace<SpaceId, SpaceCore.Model>(
    config.dbConnKv,
    ['spaces', 'space-by-id'],
    SpaceCore.Model
  )
  const indexSpaceIdByUserId = DbConnKv.withNamespace<UserId, SpaceId>(
    config.dbConnKv,
    ['spaces', 'space-id-by-user-id'],
    SpaceId
  )

  const INDEX_SPACE_IDS_KEY_ALL = 'all'
  const indexSpaceIds = DbConnKv.withNamespace<string, SpaceId[]>(
    config.dbConnKv,
    ['spaces', 'space-ids'],
    p.arr(SpaceId)
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

    async getByUserId(userId) {
      const got = await indexSpaceIdByUserId.get(userId)

      if (isErr(got)) {
        return got
      }

      return this.get(got.value)
    },

    async _upsert(space) {
      const spaceId = SpaceCore.toSpaceId(space)

      if (!spaceId) {
        return Err('Invalid space. Failed to derive spaceId')
      }

      const entries = SpaceCore.toUserIds(space).map((userId): [UserId, SpaceId] => [userId, spaceId])

      const allSpaceIds = new Set(Result.withDefault(await indexSpaceIds.get(INDEX_SPACE_IDS_KEY_ALL), null) ?? [])
      allSpaceIds.add(spaceId)

      const results = [
        await indexSpaceIds.set(INDEX_SPACE_IDS_KEY_ALL, Array.from(allSpaceIds)),
        await spacesBySpaceId.set(spaceId, space),
        await indexSpaceIdByUserId.setMany(entries)
      ]

      return pipe(
        results,
        (results) => Result.combine(results),
        (result) => Result.mapOk(result, () => null)
      )
    },

    async list(input) {
      const allSpaceIds = Result.withDefault(await indexSpaceIds.get(INDEX_SPACE_IDS_KEY_ALL), null) ?? []

      const subset = allSpaceIds.slice(input.offset, input.offset + input.limit)

      const got = await spacesBySpaceId.getMany(subset)

      if (isErr(got)) {
        return got
      }

      return got
    },

    async hasEvent(spaceId, eventId) {
      const got = await spacesBySpaceId.get(spaceId)

      if (isErr(got)) {
        return false
      }

      return Boolean(got.value && eventId in got.value.eventIds)
    },

    async update(spaceEvent) {
      const maybeSpace = Result.withDefault(await spacesBySpaceId.get(spaceEvent.spaceId), null)

      const space = maybeSpace ?? SpaceCore.init

      const spaceNew = SpaceCore.appendEvent({
        event: spaceEvent,
        model: space
      })

      return this._upsert(spaceNew)
    },

    async getWithFallback(spaceId) {
      return Result.withDefault(await this.get(spaceId), null) ?? SpaceCore.init
    },

    async getEvent(spaceId, eventId) {
      const space = Result.withDefault(await this.get(spaceId), null)

      if (!space) {
        return Ok(null)
      }

      const event = SpaceCore.toEventWithMeta(space, eventId)

      return Ok(event)
    },

    async merge(space) {
      const spaceId = SpaceCore.toSpaceId(space)

      const currentSpace = Result.withDefault(await this.get(spaceId), null) ?? SpaceCore.init

      const spaceNew = SpaceCore.mergeLeft(space, currentSpace)

      return this._upsert(spaceNew)
    }
  }
}
