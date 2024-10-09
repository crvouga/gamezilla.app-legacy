import { Err, Ok, Result, TimeSpan, isErr, pipe } from 'gamezilla-app/@/core'
import { p } from 'gamezilla-app/@/core/parser'
import { LRUCache } from 'gamezilla-app/@/least-recently-used-cache'
import { SpaceId, type UserId } from 'gamezilla-app/app/@/data'
import { DbConnKv, type IDbConnKv } from 'gamezilla-app/app/@/server/db-conn-kv'
import { ILogger, Logger } from 'gamezilla-app/app/@/server/logger'
import * as SpaceCore from '../space-core'
import type { ISpacesCoreServer } from './interface'

export type Config = {
  t: 'db-conn-kv'
  dbConnKv: IDbConnKv
  logger: ILogger
}

export const SpacesCoreServer = async (config: Config): Promise<ISpacesCoreServer> => {
  const dbConnKv = await pipe(
    config.dbConnKv,
    (dbConnKv) =>
      false
        ? DbConnKv.withThrottledWrites({
            logger: Logger.prefix('spaces-core-server', config.logger),
            dbConnKv: dbConnKv,
            throttle: TimeSpan.seconds(5)
          })
        : dbConnKv,
    async (dbConnKv) =>
      false
        ? DbConnKv.withCache({
            logger: Logger.prefix('spaces-core-server', config.logger),
            source: dbConnKv,
            cache: await DbConnKv({ t: 'hash-map', map: LRUCache({ maxCapacity: 2000 }) })
          })
        : dbConnKv,
    async (dbConnKv) =>
      DbConnKv.withReducedParsing({
        dbConnKv: await dbConnKv,
        verifiedKeys: new Set()
      })
  )
  const spacesBySpaceId = DbConnKv.withNamespace<SpaceId, SpaceCore.Model>(
    dbConnKv,
    ['spaces', 'space-by-id'],
    SpaceCore.Model
  )
  const indexSpaceIdByUserId = DbConnKv.withNamespace<UserId, SpaceId>(
    dbConnKv,
    ['spaces', 'space-id-by-user-id'],
    SpaceId
  )

  const INDEX_SPACE_IDS_KEY_ALL = 'all'
  const indexSpaceIds = DbConnKv.withNamespace<string, SpaceId[]>(dbConnKv, ['spaces', 'space-ids'], p.arr(SpaceId))

  const get: ISpacesCoreServer['get'] = async (spaceId) => {
    if (!spaceId) {
      return Ok(null)
    }

    const got = await spacesBySpaceId.get(spaceId)

    if (isErr(got)) {
      return got
    }

    return Ok(got.value)
  }

  const upsert: ISpacesCoreServer['upsert'] = async (space) => {
    const spaceId = SpaceCore.toSpaceId(space)

    if (!spaceId) {
      return Err('Invalid space. Failed to derive spaceId')
    }

    const entries = SpaceCore.toUserIds(space).map((userId): [UserId, SpaceId] => [userId, spaceId])

    const allSpaceIds = new Set(Result.withDefault(await indexSpaceIds.get(INDEX_SPACE_IDS_KEY_ALL), null) ?? [])
    allSpaceIds.add(spaceId)

    const results = await Promise.all([
      indexSpaceIds.set(INDEX_SPACE_IDS_KEY_ALL, Array.from(allSpaceIds)),
      spacesBySpaceId.set(spaceId, space),
      indexSpaceIdByUserId.setMany(entries)
    ])

    return pipe(
      results,
      (results) => Result.combine(results),
      (result) => Result.mapOk(result, () => null)
    )
  }

  return {
    get,
    upsert,
    async getByUserId(userId) {
      if (!userId) {
        return Ok(null)
      }

      const got = await indexSpaceIdByUserId.get(userId)

      if (isErr(got)) {
        return got
      }

      return get(got.value)
    },

    async list(input) {
      const allSpaceIds = Result.withDefault(await indexSpaceIds.get(INDEX_SPACE_IDS_KEY_ALL), null) ?? []

      const subset = allSpaceIds.slice(input.offset, input.offset + input.limit)

      const got = await spacesBySpaceId.getMany(subset)

      if (isErr(got)) {
        return got
      }

      return Ok({
        items: got.value,
        total: allSpaceIds.length,
        limit: input.limit,
        offset: input.offset
      })
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

      return upsert(spaceNew)
    },

    async getEvent(spaceId, eventId) {
      const space = Result.withDefault(await get(spaceId), null)

      if (!space) {
        return Ok(null)
      }

      const event = SpaceCore.toEventWithMeta(space, eventId)

      return Ok(event)
    },

    async merge(space) {
      const spaceId = SpaceCore.toSpaceId(space)

      const currentSpace = Result.withDefault(await get(spaceId), null) ?? SpaceCore.init

      const spaceNew = SpaceCore.mergeLeft(space, currentSpace)

      return upsert(spaceNew)
    }
  }
}
