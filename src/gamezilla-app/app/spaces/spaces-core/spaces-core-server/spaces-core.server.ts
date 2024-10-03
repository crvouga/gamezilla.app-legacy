import { Result } from 'gamezilla-app/@/core'
import type { SpaceId, UserId } from 'gamezilla-app/app/@/data'
import type { EventId, WithEventId } from '../../@/event'
import * as SpaceCore from '../space-core'
import type { SpaceCoreEvent } from '../space-core-event'
import type * as SpaceState from '../space-core-state'
import type { ISpacesDb } from './spaces-core-db/spaces-core-db'

const getSpaceById = async (spacesDb: ISpacesDb, spaceId: SpaceId): Promise<SpaceCore.Model> => {
  return Result.withDefault(await spacesDb.get(spaceId), null) ?? SpaceCore.init
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

const update = async (spacesDb: ISpacesDb, spaceEvent: WithEventId<SpaceCoreEvent>) => {
  const maybeSpace = Result.withDefault(await spacesDb.get(spaceEvent.spaceId), null)

  const space = maybeSpace ?? SpaceCore.init

  const spaceNew = SpaceCore.appendEvent({
    event: spaceEvent,
    model: space
  })

  await spacesDb.upsert(spaceNew)
}

const mergeOne = async (spacesDb: ISpacesDb, space: SpaceCore.Model) => {
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
  getSpaceById,
  getSpaceStarted,
  update,
  mergeOne,
  getEventWithMeta,
  getSpaceByUserId,
  hasEvent
}
