import { Result } from 'gamezilla-app/@/core'
import type { SpaceId, UserId } from 'gamezilla-app/app/@/data'
import type { IDbConnKv } from 'gamezilla-app/app/@/server/db-conn-kv'
import type { EventId, WithEventId } from '../../@/event'
import * as SpaceCore from '../space-core'
import type { SpaceCoreEvent } from '../space-core-event'
import type * as SpaceState from '../space-core-state'
import { SpacesDb } from './spaces-core-db'
import type { ISpacesDb } from './spaces-core-db/spaces-core-db'

//
//
//
//
//
//

export type Deps = {
  spacesDb: ISpacesDb
}

const initDeps = async (input: { dbConnKv: IDbConnKv }): Promise<Deps> => {
  return {
    spacesDb: SpacesDb({
      t: 'db-conn-kv',
      dbConnKv: input.dbConnKv
    })
  }
}

const getSpaceById = async (spacesDb: ISpacesDb, spaceId: SpaceId): Promise<SpaceCore.Model> => {
  const got = await spacesDb.get(spaceId)

  const maybeSpace = Result.withDefault(got, null)

  const space = maybeSpace ?? SpaceCore.init

  return space
}

const getSpaceStarted = async (spaceDb: ISpacesDb, spaceId?: SpaceId | null): Promise<SpaceState.Started | null> => {
  if (!spaceId) {
    return null
  }

  const spaceModel = Result.withDefault(await spaceDb.get(spaceId), null)

  if (!spaceModel) {
    return null
  }

  const spaceState = SpaceCore.toSpaceStarted(spaceModel)

  return spaceState
}

//
//
//
//
//
//

const update = async ({ spaceEvent, spacesDb }: { spacesDb: ISpacesDb; spaceEvent: WithEventId<SpaceCoreEvent> }) => {
  const maybeSpace = Result.withDefault(await spacesDb.get(spaceEvent.spaceId), null)

  const space = maybeSpace ?? SpaceCore.init

  const spaceNew = SpaceCore.appendEvent({
    event: spaceEvent,
    model: space
  })

  await spacesDb.upsert(spaceNew)
}

const mergeOne = async ({ spacesDb, space }: { spacesDb: ISpacesDb; space: SpaceCore.Model }) => {
  const spaceId = SpaceCore.toSpaceId(space)

  if (!spaceId) {
    return
  }

  const currentSpace = await getSpaceById(spacesDb, spaceId)

  const spaceNew = SpaceCore.mergeLeft(space, currentSpace)

  await spacesDb.upsert(spaceNew)
}

const getEventWithMeta = async (spacesDb: ISpacesDb, spaceId: SpaceId, eventId: EventId) => {
  const space = await getSpaceById(spacesDb, spaceId)

  if (!space) {
    return null
  }

  const event = SpaceCore.toEventWithMeta(space, eventId)

  return event
}

const getSpaceByUserId = async (spacesDb: ISpacesDb, userId: UserId): Promise<SpaceCore.Model | null> => {
  const got = await spacesDb.getByUserId(userId)

  const space = Result.withDefault(got, null)

  return space
}

const hasEvent = async (spacesDb: ISpacesDb, spaceId: SpaceId, eventId: EventId) => {
  const space = await getSpaceById(spacesDb, spaceId)

  return SpaceCore.hasEvent(space, eventId)
}

export const SpacesCoreServer = {
  initDeps,
  getSpaceById,
  getSpaceStarted,
  update,
  mergeOne,
  getEventWithMeta,
  getSpaceByUserId,
  hasEvent
}
