import { SpaceId, UserId } from "gamezilla-app/app/@shared/data"
import { Result } from "gamezilla-app/@shared/core"
import { EventId, WithEventId } from "../@shared/event"
import * as Space from "./space"
import { ISpacesDb } from "./space-db/space-db"
import { SpaceEvent } from "./space-event"
import * as SpaceState from "./space-state"

//
//
//
//
//
//

const listSpaces = async (input: {
  spacesDb: ISpacesDb
  limit: number
  offset: number
  where?: {
    spaceId?: SpaceId
  }
  sort?: "newest" | "oldest"
}): Promise<Space.Model[]> => {
  const listed = await input.spacesDb.list({
    limit: input.limit,
    offset: input.offset,
    where: input.where,
  })

  const spaces = Result.withDefault(listed, [])

  return spaces
}

const getSpaceById = async (
  spacesDb: ISpacesDb,
  spaceId: SpaceId,
): Promise<Space.Model> => {
  const got = await spacesDb.get(spaceId)
  const maybeSpace = Result.withDefault(got, null)
  const space = maybeSpace ?? Space.init
  return space
}

const getSpaceStarted = async (
  spaceDb: ISpacesDb,
  spaceId?: SpaceId | null,
): Promise<SpaceState.Started | null> => {
  if (!spaceId) {
    return null
  }

  const spaceModel = Result.withDefault(await spaceDb.get(spaceId), null)

  if (!spaceModel) {
    return null
  }

  const spaceState = Space.toSpaceStarted(spaceModel)

  return spaceState
}

//
//
//
//
//
//

const update = async ({
  spaceEvent,
  spacesDb,
}: {
  spacesDb: ISpacesDb
  spaceEvent: WithEventId<SpaceEvent>
}) => {
  const space = await getSpaceById(spacesDb, spaceEvent.spaceId)

  const spaceNew = Space.appendEvent({ event: spaceEvent, model: space })

  await spacesDb.upsert(spaceNew)
}

const mergeOne = async ({
  spacesDb,
  space,
}: {
  spacesDb: ISpacesDb
  space: Space.Model
}) => {
  const spaceId = Space.toSpaceId(space)

  if (!spaceId) {
    return
  }

  const currentSpace = await getSpaceById(spacesDb, spaceId)

  const spaceNew = Space.mergeLeft(space, currentSpace)

  await spacesDb.upsert(spaceNew)
}

const getEventWithMeta = async (
  spacesDb: ISpacesDb,
  spaceId: SpaceId,
  eventId: EventId,
) => {
  const space = await getSpaceById(spacesDb, spaceId)

  if (!space) {
    return null
  }

  const event = Space.toEventWithMeta(space, eventId)

  return event
}

const getSpaceByUserId = async (
  spacesDb: ISpacesDb,
  userId: UserId,
): Promise<Space.Model | null> => {
  const got = await spacesDb.getByUserId(userId)

  const space = Result.withDefault(got, null)

  return space
}

const hasEvent = async (
  spacesDb: ISpacesDb,
  spaceId: SpaceId,
  eventId: EventId,
) => {
  const space = await getSpaceById(spacesDb, spaceId)
  return Space.hasEvent(space, eventId)
}

export const SpacesCoreServer = {
  getSpaceByUserId,
  getSpaceById,
  update,
  listSpaces,
  getSpaceStarted,
  getEventWithMeta,
  hasEvent,
  mergeOne,
}
