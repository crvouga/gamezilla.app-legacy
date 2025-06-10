import { KeyValueDb, type IKeyValueDb } from '~/@/key-value-db'
import { ILogger } from '~/@/logger'
import { Err, Ok, isErr } from '~/@/result'
import { SpaceId } from '~/app/@/data/space-id'
import { Space } from '..'
import type { ISpaceDb, SpaceDbConfig } from './interface'

export type Config = SpaceDbConfig & {
  t: 'key-value-db'
  keyValueDb: IKeyValueDb
  logger: ILogger
  namespace: string[]
}

export const SpaceDb = async (config: Config): Promise<ISpaceDb> => {
  const keyValueDb = config.keyValueDb

  const spacesBySpaceId = KeyValueDb.withNamespace<SpaceId, Space.Model>({
    keyValueDb,
    namespace: [...config.namespace, 'spaces', 'space-by-id'],
    schema: Space.Model,
  })

  config.input?.sub(async (msg) => {
    switch (msg.t) {
      case 'dangerously-override-model': {
        const { model } = msg

        const spaceId = Space.toSpaceId(model)

        if (!spaceId) {
          config.logger.error('Failed to dangerously set model. Failed to derive spaceId from model')
          return
        }

        config.logger.debug(`Dangerously setting model for spaceId=${spaceId}`)

        await Promise.all([spacesBySpaceId.zap(spaceId), upsert(model)])
        config.output?.pub({ t: 'model-dangerously-overridden', model })
        return
      }
    }
  })

  const upsert: ISpaceDb['upsert'] = async (space) => {
    const spaceId = Space.toSpaceId(space)

    if (!spaceId) {
      return Err('Invalid space. Failed to derive spaceId')
    }

    const result = await spacesBySpaceId.set(spaceId, space)

    return result
  }

  const get: ISpaceDb['get'] = async (spaceIds) => {
    const got = await spacesBySpaceId.getMany(spaceIds)
    if (isErr(got)) return Ok([])
    return Ok(got.value)
  }

  return {
    upsert,
    get,
  }
}
