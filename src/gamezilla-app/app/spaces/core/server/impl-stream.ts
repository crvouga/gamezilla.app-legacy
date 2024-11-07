import { isErr, Ok, unwrapOr } from '@/core'
import { EventSourced } from '@/event-sourced'
import { WithEventMeta } from '@/event-sourced/event'
import { IRuntime } from '@/runtime'
import { SpaceId } from 'gamezilla-app/app/@/data'
import { DbConnKv, type IDbConnKv } from 'gamezilla-app/app/@/server/db-conn-kv'
import { ILogger, Logger } from 'gamezilla-app/app/@/server/logger'
import { EventId } from 'gamezilla-app/app/@/server/stream/event-id'
import { IStream } from 'gamezilla-app/app/@/server/stream/interface'
import * as SpaceCore from '../space-core'
import { SpaceEvent } from '../space-event'
import * as SpaceCoreState from '../space-state'
import * as ImplDbConnKv from './impl-db-conn-kv'
import type { ISpacesCoreServer } from './interface'

export type Config = {
  t: 'stream'
  dbConnKv: IDbConnKv
  stream: IStream<WithEventMeta<SpaceEvent>>
  logger: ILogger
  runtime: IRuntime
}

export const SpacesCoreServer = async (config: Config): Promise<ISpacesCoreServer> => {
  const implDbConnKb = await ImplDbConnKv.SpacesCoreServer({
    t: 'db-conn-kv',
    dbConnKv: config.dbConnKv,
    logger: Logger.prefix('db-conn-kv', config.logger),
    runtime: config.runtime
  })

  const snapshots = DbConnKv.withNamespace<SpaceId, SpaceCoreState.State>({
    dbConnKv: config.dbConnKv,
    namespace: ['spaces', 'snapshots'],
    parser: SpaceCoreState.State
  })

  const upsert: ISpacesCoreServer['upsert'] = async (space) => {
    implDbConnKb.upsert(space)

    const snapshot = EventSourced.toState(SpaceCore.config, space)

    const spaceId = 'spaceId' in snapshot ? snapshot.spaceId : null

    if (!spaceId) {
      return Ok(null)
    }

    await snapshots.set(spaceId, snapshot)

    await Promise.all(space.events.map((event) => config.stream.append(spaceId, event.eventId, event)))

    return Ok(null)
  }

  const update: ISpacesCoreServer['update'] = async (event) => {
    implDbConnKb.update(event)
    if (await hasEvent(event.spaceId, event.eventId)) {
      return Ok(null)
    }

    const maybeSpace = unwrapOr(await get(event.spaceId), null)

    const space = maybeSpace ?? SpaceCore.init

    const spaceNew = EventSourced.appendEvent(SpaceCore.config, space, event)

    return upsert(spaceNew)
  }

  const get: ISpacesCoreServer['get'] = async (spaceId) => {
    if (!spaceId) {
      return Ok(null)
    }

    const gotSnapshot = await snapshots.get(spaceId)

    if (isErr(gotSnapshot)) {
      return gotSnapshot
    }

    const snapshot = gotSnapshot.value || SpaceCoreState.init

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

  const hasEvent: ISpacesCoreServer['hasEvent'] = async (spaceId, eventId) => {
    return unwrapOr(await config.stream.has(spaceId, eventId), false)
  }

  const getByUserId: ISpacesCoreServer['getByUserId'] = async (userId) => {
    return implDbConnKb.getByUserId(userId)
  }

  const list: ISpacesCoreServer['list'] = async (input) => {
    return implDbConnKb.list(input)
  }

  const merge: ISpacesCoreServer['merge'] = async (space) => {
    const spaceId = SpaceCore.toSpaceId(space)

    const currentSpace = unwrapOr(await get(spaceId), null) ?? SpaceCore.init

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
    update
  }
}
