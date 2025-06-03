import { pipe } from '~/@/function/pipe'
import { KeyValueDb, type IKeyValueDb } from '~/@/key-value-db'
import { LRUCache } from '~/@/least-recently-used-cache'
import { ILogger, Logger } from '~/@/logger'
import { Err, Ok, Result, isErr } from '~/@/result'
import { IRuntime } from '~/@/runtime'
import { s } from '~/@/schema'
import { TimeSpan } from '~/@/time/time-span'
import { SpaceId } from '~/app/@/data/space-id'
import { type UserId } from '~/app/@/data/user-id'
import { Space } from '../../space/space'
import type { ISpacesDb, SpacesDbConfig } from './interface'

export type Config = SpacesDbConfig & {
  t: 'key-value-db'
  keyValueDb: IKeyValueDb
  logger: ILogger
  runtime: IRuntime
  writeThrottle: TimeSpan
  namespace: string[]
}

export const SpacesDb = async (config: Config): Promise<ISpacesDb> => {
  // const { runtime } = config
  const logger = Logger.prefix('spaces-core-async', config.logger)

  const verifiedKeys = new Set<string>()
  const cache = await KeyValueDb({ t: 'hash-map', map: LRUCache({ maxCapacity: 10_000 }) })
  // const throttle = config.writeThrottle
  const keyValueDb = await pipe(
    config.keyValueDb,
    // async (keyValueDb) => KeyValueDb({ t: 'with-throttled-writes', logger, keyValueDb, throttle, runtime }),
    // async (keyValueDb) => KeyValueDb({ t: 'with-cache', logger, source: await keyValueDb, cache }),
    async (keyValueDb) => KeyValueDb({ t: 'with-reduced-parsing', logger, keyValueDb: await keyValueDb, verifiedKeys }),
  )

  const spacesBySpaceId = KeyValueDb.withNamespace<SpaceId, Space.Model>({
    keyValueDb,
    namespace: [...config.namespace, 'spaces', 'space-by-id'],
    schema: Space.Model,
  })
  const indexSpaceIdByUserId = KeyValueDb.withNamespace<UserId, SpaceId>({
    keyValueDb,
    namespace: [...config.namespace, 'spaces', 'space-id-by-user-id'],
    schema: SpaceId,
  })
  const indexSpaceIds = KeyValueDb.withNamespace<string, SpaceId[]>({
    keyValueDb,
    namespace: [...config.namespace, 'spaces', 'space-ids'],
    schema: s.arr(SpaceId),
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

  const upsert: ISpacesDb['upsert'] = async (space) => {
    const spaceId = Space.toSpaceId(space)

    if (!spaceId) {
      return Err('Invalid space. Failed to derive spaceId')
    }

    const allSpaceIds = new Set(Result.unwrapOr(await indexSpaceIds.get(INDEX_SPACE_IDS_KEY_ALL), null) ?? [])
    allSpaceIds.add(spaceId)

    const setIndexSpaceIds = await indexSpaceIds.set(INDEX_SPACE_IDS_KEY_ALL, Array.from(allSpaceIds))
    const setSpaceBySpaceId = await spacesBySpaceId.set(spaceId, space)
    const setIndexSpaceIdByUserId = await indexSpaceIdByUserId.setMany(
      Space.toUserIds(space).map((userId): [UserId, SpaceId] => [userId, spaceId]),
    )

    const result = pipe(
      [setIndexSpaceIds, setSpaceBySpaceId, setIndexSpaceIdByUserId],
      (results) => Result.combine(results),
      (result) => Result.mapOk(result, () => null),
    )

    return result
  }

  const query: ISpacesDb['query'] = async (input) => {
    const allSpaceIds = Result.unwrapOr(await indexSpaceIds.get(INDEX_SPACE_IDS_KEY_ALL), null) ?? []

    const subset = allSpaceIds.slice(input.pagination.offset, input.pagination.offset + input.pagination.limit)

    const got = await spacesBySpaceId.getMany(subset)

    if (isErr(got)) return got

    return Ok({
      items: got.value,
      total: allSpaceIds.length,
      limit: input.pagination.limit,
      offset: input.pagination.offset,
    })
  }

  return {
    upsert,
    query,
  }
}
