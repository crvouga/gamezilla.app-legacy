import { isErr, Ok, unwrapOr } from '~/@/result'
import { EventSourced } from '~/@/event-sourced'
import { WithEventMeta } from '~/@/event-sourced/event'
import { IRuntime } from '~/@/runtime'
import { SpaceId } from '~/app/@/data/space-id'
import { DbConnKv, type IDbConnKv } from '~/@/db-conn-kv'
import { ILogger, Logger } from '~/@/logger'
import { EventId } from '~/@/stream/event-id'
import { IStream } from '~/@/stream/interface'
import { SpaceSpace } from '../space'
import { SpaceEvent } from '../space-event'
import { SpaceState } from '../space-state'
import * as ImplDbConnKv from './impl-db-conn-kv'
import type { ISpaceBackend } from './interface'

export type Config = {
  t: 'stream'
  dbConnKv: IDbConnKv
  stream: IStream<WithEventMeta<SpaceEvent>>
  logger: ILogger
  runtime: IRuntime
}

export const SpaceBackend = async (config: Config): Promise<ISpaceBackend> => {
  const implDbConnKb = await ImplDbConnKv.SpaceBackend({
    t: 'db-conn-kv',
    dbConnKv: config.dbConnKv,
    logger: Logger.prefix('db-conn-kv', config.logger),
    runtime: config.runtime,
  })

  const snapshots = DbConnKv.withNamespace<SpaceId, SpaceState.State>({
    dbConnKv: config.dbConnKv,
    namespace: ['spaces', 'snapshots'],
    parser: SpaceState.State,
  })

  const upsert: ISpaceBackend['upsert'] = async (space) => {
    implDbConnKb.upsert(space)

    const snapshot = EventSourced.toState(SpaceSpace.config, space)

    const spaceId = 'spaceId' in snapshot ? snapshot.spaceId : null

    if (!spaceId) {
      return Ok(null)
    }

    await snapshots.set(spaceId, snapshot)

    await Promise.all(space.events.map((event) => config.stream.append(spaceId, event.eventId, event)))

    return Ok(null)
  }

  const update: ISpaceBackend['update'] = async (event) => {
    implDbConnKb.update(event)
    if (await hasEvent(event.spaceId, event.eventId)) {
      return Ok(null)
    }

    const maybeSpace = unwrapOr(await get(event.spaceId), null)

    const space = maybeSpace ?? SpaceSpace.init

    const spaceNew = EventSourced.appendEvent(SpaceSpace.config, space, event)

    return upsert(spaceNew)
  }

  const get: ISpaceBackend['get'] = async (spaceId) => {
    if (!spaceId) {
      return Ok(null)
    }

    const gotSnapshot = await snapshots.get(spaceId)

    if (isErr(gotSnapshot)) {
      return gotSnapshot
    }

    const snapshot = gotSnapshot.value || SpaceState.init

    const gotEvents = await config.stream.startingFrom(spaceId, snapshot.latestEventId ?? EventId.init())

    if (isErr(gotEvents)) {
      return gotEvents
    }

    const events = gotEvents.value

    if (events.length === 0) {
      return Ok(null)
    }

    const model = EventSourced.initFromSnapshot(snapshot, events)

    return Ok(model)
  }

  const hasEvent: ISpaceBackend['hasEvent'] = async (spaceId, eventId) => {
    return unwrapOr(await config.stream.has(spaceId, eventId), false)
  }

  const getByUserId: ISpaceBackend['getByUserId'] = async (userId) => {
    return implDbConnKb.getByUserId(userId)
  }

  const list: ISpaceBackend['list'] = async (input) => {
    return implDbConnKb.list(input)
  }

  const merge: ISpaceBackend['merge'] = async (space) => {
    const spaceId = SpaceSpace.toSpaceId(space)

    const currentSpace = unwrapOr(await get(spaceId), null) ?? SpaceSpace.init

    const spaceNew = EventSourced.mergeLeft(space, currentSpace)

    return upsert(spaceNew)
  }

  return {
    get,
    upsert,
    hasEvent,
    getByUserId,
    list,
    merge,
    update,
  }
}
