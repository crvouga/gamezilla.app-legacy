import { DbConnKv, type IDbConnKv } from '~/@/db-conn-kv'
import { EventSourced } from '~/@/event-sourced'
import { pipe } from '~/@/function/pipe'
import { LRUCache } from '~/@/least-recently-used-cache'
import { ILogger, Logger } from '~/@/logger'
import { p } from '~/@/parser'
import { Err, Ok, Result, isErr, unwrapOr } from '~/@/result'
import { IRuntime } from '~/@/runtime'
import { TimeSpan } from '~/@/time/time-span'
import { SpaceId } from '~/app/@/data/space-id'
import { type UserId } from '~/app/@/data/user-id'
import { SpaceCore } from '../space-core'
import type { ISpacesCoreServer } from './interface'

export type Config = {
  t: 'db-conn-kv'
  dbConnKv: IDbConnKv
  logger: ILogger
  runtime: IRuntime
}

export const SpacesCoreServer = async (config: Config): Promise<ISpacesCoreServer> => {
  const logger = Logger.prefix('db-conn-kv', config.logger)

  const dbConnKv = await pipe(
    config.dbConnKv,
    async (dbConnKv) =>
      DbConnKv({
        t: 'with-throttled-writes',
        logger,
        dbConnKv,
        throttle: TimeSpan.seconds(10),
        runtime: config.runtime
      }),
    async (dbConnKv) =>
      DbConnKv({
        t: 'with-cache',
        logger,
        source: await dbConnKv,
        cache: await DbConnKv({ t: 'hash-map', map: LRUCache({ maxCapacity: 10_000 }) })
      }),
    async (dbConnKv) =>
      DbConnKv({
        t: 'with-reduced-parsing',
        logger,
        dbConnKv: await dbConnKv,
        verifiedKeys: new Set()
      })
  )

  const spacesBySpaceId = DbConnKv.withNamespace<SpaceId, SpaceCore.Model>({
    dbConnKv,
    namespace: ['spaces', 'space-by-id'],
    parser: SpaceCore.Model
  })
  const indexSpaceIdByUserId = DbConnKv.withNamespace<UserId, SpaceId>({
    dbConnKv,
    namespace: ['spaces', 'space-id-by-user-id'],
    parser: SpaceId
  })
  const indexSpaceIds = DbConnKv.withNamespace<string, SpaceId[]>({
    dbConnKv,
    namespace: ['spaces', 'space-ids'],
    parser: p.arr(SpaceId)
  })
  const INDEX_SPACE_IDS_KEY_ALL = 'all'

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

    const allSpaceIds = new Set(Result.unwrapOr(await indexSpaceIds.get(INDEX_SPACE_IDS_KEY_ALL), null) ?? [])
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

  const hasEvent: ISpacesCoreServer['hasEvent'] = async (spaceId, eventId) => {
    const got = await spacesBySpaceId.get(spaceId)

    if (isErr(got)) {
      return false
    }

    return Boolean(got.value && eventId in got.value.eventIds)
  }

  return {
    get,
    upsert,
    hasEvent,
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
      const allSpaceIds = Result.unwrapOr(await indexSpaceIds.get(INDEX_SPACE_IDS_KEY_ALL), null) ?? []

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

    async update(spaceEvent) {
      if (await hasEvent(spaceEvent.spaceId, spaceEvent.eventId)) {
        return Ok(null)
      }

      const maybeSpace = unwrapOr(await spacesBySpaceId.get(spaceEvent.spaceId), null)

      const space = maybeSpace ?? SpaceCore.init

      const spaceNew = EventSourced.appendEvent(SpaceCore.config, space, spaceEvent)

      return upsert(spaceNew)
    },

    async merge(space) {
      const spaceId = SpaceCore.toSpaceId(space)

      const currentSpace = Result.unwrapOr(await get(spaceId), null) ?? SpaceCore.init

      const spaceNew = EventSourced.mergeLeft(space, currentSpace)

      return upsert(spaceNew)
    }
  }
}
