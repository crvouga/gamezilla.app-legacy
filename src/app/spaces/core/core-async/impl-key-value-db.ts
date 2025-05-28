import { KeyValueDb, type IKeyValueDb } from '~/@/key-value-db'
import { EventSourced } from '~/@/event-sourced'
import { pipe } from '~/@/function/pipe'
import { LRUCache } from '~/@/least-recently-used-cache'
import { ILogger, Logger } from '~/@/logger'
import { p } from '~/@/schema'
import { Err, Ok, Result, isErr, unwrapOr } from '~/@/result'
import { IRuntime } from '~/@/runtime'
import { TimeSpan } from '~/@/time/time-span'
import { SpaceId } from '~/app/@/data/space-id'
import { type UserId } from '~/app/@/data/user-id'
import { Space } from '../space'
import type { ISpacesCoreAsync, SpacesCoreConfig } from './interface'

export type Config = SpacesCoreConfig & {
  t: 'key-value-db'
  keyValueDb: IKeyValueDb
  logger: ILogger
  runtime: IRuntime
  writeThrottle: TimeSpan
  namespace: string[]
}

export const SpacesCoreAsync = async (config: Config): Promise<ISpacesCoreAsync> => {
  const { runtime } = config
  const logger = Logger.prefix('key-value-db', config.logger)

  //
  //
  //

  const verifiedKeys = new Set<string>()
  const cache = await KeyValueDb({ t: 'hash-map', map: LRUCache({ maxCapacity: 10_000 }) })
  const throttle = config.writeThrottle
  const keyValueDb = await pipe(
    config.keyValueDb,
    async (keyValueDb) =>
      KeyValueDb({ t: 'with-throttled-writes', logger, keyValueDb: await keyValueDb, throttle, runtime }),
    async (keyValueDb) => KeyValueDb({ t: 'with-cache', logger, source: await keyValueDb, cache }),
    async (keyValueDb) => KeyValueDb({ t: 'with-reduced-parsing', logger, keyValueDb: await keyValueDb, verifiedKeys }),
  )

  const spacesBySpaceId = KeyValueDb.withNamespace<SpaceId, Space.Model>({
    keyValueDb,
    namespace: [...config.namespace, 'spaces', 'space-by-id'],
    parser: Space.Model,
  })
  const indexSpaceIdByUserId = KeyValueDb.withNamespace<UserId, SpaceId>({
    keyValueDb,
    namespace: [...config.namespace, 'spaces', 'space-id-by-user-id'],
    parser: SpaceId,
  })
  const indexSpaceIds = KeyValueDb.withNamespace<string, SpaceId[]>({
    keyValueDb,
    namespace: [...config.namespace, 'spaces', 'space-ids'],
    parser: p.arr(SpaceId),
  })
  const INDEX_SPACE_IDS_KEY_ALL = 'all'

  //
  //
  //

  config._dangerouslyOverrideModel?.sub(async (model) => {
    const spaceId = Space.toSpaceId(model)
    if (!spaceId) {
      config.logger.error('Failed to dangerously set model. Failed to derive spaceId from model')
      return
    }
    config.logger.debug(`Dangerously setting model for spaceId=${spaceId}`)

    verifiedKeys.clear()
    await Promise.all([cache.zap(spaceId), config.keyValueDb.zap(spaceId), upsert(model)])
  })

  //
  //
  //

  const get: ISpacesCoreAsync['get'] = async (spaceId) => {
    if (!spaceId) {
      return Ok(null)
    }

    const got = await spacesBySpaceId.get(spaceId)

    if (isErr(got)) {
      return got
    }

    return Ok(got.value)
  }

  const upsert: ISpacesCoreAsync['upsert'] = async (space) => {
    const spaceId = Space.toSpaceId(space)

    if (!spaceId) {
      return Err('Invalid space. Failed to derive spaceId')
    }

    const allSpaceIds = new Set(Result.unwrapOr(await indexSpaceIds.get(INDEX_SPACE_IDS_KEY_ALL), null) ?? [])
    allSpaceIds.add(spaceId)

    const results = await Promise.all([
      indexSpaceIds.set(INDEX_SPACE_IDS_KEY_ALL, Array.from(allSpaceIds)),
      spacesBySpaceId.set(spaceId, space),
      indexSpaceIdByUserId.setMany(Space.toUserIds(space).map((userId): [UserId, SpaceId] => [userId, spaceId])),
    ])

    const result = pipe(
      results,
      (results) => Result.combine(results),
      (result) => Result.mapOk(result, () => null),
    )

    return result
  }

  const hasEvent: ISpacesCoreAsync['hasEvent'] = async (spaceId, eventId) => {
    const got = await spacesBySpaceId.get(spaceId)

    if (isErr(got)) {
      return false
    }

    return Boolean(got.value && eventId in got.value.eventIds)
  }

  const getByUserId: ISpacesCoreAsync['getByUserId'] = async (userId) => {
    if (!userId) {
      return Ok(null)
    }

    const got = await indexSpaceIdByUserId.get(userId)

    if (isErr(got)) {
      return got
    }

    return get(got.value)
  }

  const list: ISpacesCoreAsync['list'] = async (input) => {
    const allSpaceIds = Result.unwrapOr(await indexSpaceIds.get(INDEX_SPACE_IDS_KEY_ALL), null) ?? []

    const subset = allSpaceIds.slice(input.pagination.offset, input.pagination.offset + input.pagination.limit)

    const got = await spacesBySpaceId.getMany(subset)

    if (isErr(got)) {
      return got
    }

    return Ok({
      items: got.value,
      total: allSpaceIds.length,
      limit: input.pagination.limit,
      offset: input.pagination.offset,
    })
  }

  const update: ISpacesCoreAsync['update'] = async (spaceEvent) => {
    if (await hasEvent(spaceEvent.spaceId, spaceEvent.eventId)) {
      return Ok(null)
    }

    const maybeSpace = unwrapOr(await spacesBySpaceId.get(spaceEvent.spaceId), null)

    const space = maybeSpace ?? Space.init

    const spaceNew = EventSourced.appendEvent(Space.config, space, spaceEvent)

    return upsert(spaceNew)
  }

  const merge: ISpacesCoreAsync['merge'] = async (space) => {
    const spaceId = Space.toSpaceId(space)

    const currentSpace = Result.unwrapOr(await get(spaceId), null) ?? Space.init

    const spaceNew = EventSourced.mergeLeft(space, currentSpace)

    return upsert(spaceNew)
  }

  return {
    get,
    upsert,
    hasEvent,
    getByUserId,
    list,
    update,
    merge,
  }
}
