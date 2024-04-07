import { SpaceId } from "gamezilla-app/@CHILD/app/@SHARED/data"
import { Result } from "gamezilla-app/@SHARED/core"
import { WithEventId } from "../@SHARED/event"
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

const list = (_input: {
  limit: number
  offset: number
  where?: {
    spaceId?: SpaceId
  }
  sort?: "newest" | "oldest"
}): Space.Model[] => {
  return []
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

  const spaceNew = Space.merge(currentSpace, space)

  await spacesDb.upsert(spaceNew)
}

export const SpacesCoreServer = {
  getSpaceById,
  update,
  list,
  getSpaceStarted,
  mergeOne,
}
