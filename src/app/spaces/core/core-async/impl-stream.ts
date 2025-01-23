import { KeyValueDb, type IKeyValueDb } from '~/@/db-conn-kv'
import { EventSourced } from '~/@/event-sourced'
import { WithEventMeta } from '~/@/event-sourced/event'
import { ILogger, Logger } from '~/@/logger'
import { isErr, Ok, unwrapOr } from '~/@/result'
import { IRuntime } from '~/@/runtime'
import { EventId } from '~/@/stream/event-id'
import { IStream } from '~/@/stream/interface'
import { TimeSpan } from '~/@/time/time-span'
import { SpaceId } from '~/app/@/data/space-id'
import { Space } from '../space'
import { MsgSpace } from '../space-msg'
import { SpaceState } from '../space-state'
import * as ImplKeyValueDb from './impl-db-conn-kv'
import type { ISpacesCoreAsync, SpacesCoreConfig } from './interface'

export type Config = SpacesCoreConfig & {
  t: 'stream'
  keyValueDb: IKeyValueDb
  stream: IStream<WithEventMeta<MsgSpace>>
  logger: ILogger
  runtime: IRuntime
}

export const SpacesCoreAsync = async (config: Config): Promise<ISpacesCoreAsync> => {
  const implDbConnKb = await ImplKeyValueDb.SpacesCoreAsync({
    t: 'db-conn-kv',
    keyValueDb: config.keyValueDb,
    logger: Logger.prefix('db-conn-kv', config.logger),
    runtime: config.runtime,
    writeThrottle: TimeSpan.milliseconds(0),
  })

  const snapshots = KeyValueDb.withNamespace<SpaceId, SpaceState.State>({
    keyValueDb: config.keyValueDb,
    namespace: ['spaces', 'snapshots'],
    parser: SpaceState.State,
  })

  const upsert: ISpacesCoreAsync['upsert'] = async (space) => {
    implDbConnKb.upsert(space)

    const snapshot = EventSourced.toState(Space.config, space)

    const spaceId = 'spaceId' in snapshot ? snapshot.spaceId : null

    if (!spaceId) {
      return Ok(null)
    }

    await snapshots.set(spaceId, snapshot)

    await Promise.all(space.events.map((event) => config.stream.append(spaceId, event.eventId, event)))

    return Ok(null)
  }

  const update: ISpacesCoreAsync['update'] = async (event) => {
    implDbConnKb.update(event)
    if (await hasEvent(event.spaceId, event.eventId)) {
      return Ok(null)
    }

    const maybeSpace = unwrapOr(await get(event.spaceId), null)

    const space = maybeSpace ?? Space.init

    const spaceNew = EventSourced.appendEvent(Space.config, space, event)

    return upsert(spaceNew)
  }

  const get: ISpacesCoreAsync['get'] = async (spaceId) => {
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

  const hasEvent: ISpacesCoreAsync['hasEvent'] = async (spaceId, eventId) => {
    return unwrapOr(await config.stream.has(spaceId, eventId), false)
  }

  const getByUserId: ISpacesCoreAsync['getByUserId'] = async (userId) => {
    return implDbConnKb.getByUserId(userId)
  }

  const list: ISpacesCoreAsync['list'] = async (input) => {
    return implDbConnKb.list(input)
  }

  const merge: ISpacesCoreAsync['merge'] = async (space) => {
    const spaceId = Space.toSpaceId(space)

    const currentSpace = unwrapOr(await get(spaceId), null) ?? Space.init

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
