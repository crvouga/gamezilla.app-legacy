import { SpaceId, UserId } from "gamezilla-app/@CHILD/app/@SHARED/data"
import { p } from "gamezilla-app/@SHARED/core/parser"
import { EventId, WithEventId } from "../@SHARED/event"
import * as Space from "./space"
import { SpaceEvent } from "./space-event"
import * as SpaceState from "./space-state"

//
//
//
//
//
//

export const SpaceError = p.obj({
  t: p.l("user-already-in-a-space"),
  userId: UserId,
})
export type SpaceError = p.Infer<typeof SpaceError>

export const Model = p.obj({
  spaces: p.dict(SpaceId, Space.Model),
  spaceIdByUserId: p.dict(UserId, SpaceId),
  errors: p.dict(EventId, SpaceError),
})
export type Model = p.Infer<typeof Model>

export const init: Model = {
  spaces: {},
  spaceIdByUserId: {},
  errors: {},
}

//
//
//
//
//
//

export const listSpaces = (_input: {
  limit: number
  offset: number
  where?: {
    spaceId?: SpaceId
  }
  sort?: "newest" | "oldest"
}): Space.Model[] => {
  return []
}

export const toSpaceIdByUserId = (
  model: Model,
  userId: UserId | null | undefined,
): SpaceId | null => {
  return userId ? model.spaceIdByUserId[userId] ?? null : null
}

export const toSpace = (model: Model, spaceId: SpaceId): Space.Model | null => {
  return model.spaces[spaceId] ?? null
}

export const toErrorByEvenId = (
  model: Model,
  eventId: EventId,
): SpaceError | null => {
  return model.errors[eventId] ?? null
}

export const hasEvent = (
  model: Model,
  spaceId: SpaceId,
  eventId: EventId,
): boolean => {
  const space = toSpace(model, spaceId)
  return Boolean(space && Space.hasEvent(space, eventId))
}

export const toSpaceByUserId = ({
  model,
  userId,
}: {
  model: Model
  userId: UserId
}): Space.Model | null => {
  const spaceId = model.spaceIdByUserId[userId]

  if (!spaceId) {
    return null
  }

  const space = model.spaces[spaceId]

  if (!space) {
    return null
  }

  return space
}

export const toEventWithMeta = (
  model: Model,
  spaceId: SpaceId,
  msgEvtId: EventId,
) => {
  const space = model.spaces[spaceId]

  if (!space) {
    return null
  }

  return Space.toEventWithMeta(space, msgEvtId)
}

export const toSpaceState = (
  model: Model,
  spaceId?: SpaceId | null | undefined,
): SpaceState.State => {
  if (!spaceId) {
    return SpaceState.init
  }

  const spaceModel = model.spaces[spaceId]

  if (!spaceModel) {
    return SpaceState.init
  }

  const spaceState = Space.deriveState(spaceModel)

  return spaceState
}

export const toSpaceStarted = (
  model: Model,
  spaceId?: SpaceId | null,
): SpaceState.Started | null => {
  if (!spaceId) {
    return null
  }

  const spaceModel = model.spaces[spaceId]

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

export type UpdateError = "space-not-found" | "already-in-space"

export const update = (_input: { spaceEvent: WithEventId<SpaceEvent> }) => {
  return {}
}

export const appendEvent = ({
  model,
  spaceEvent,
}: {
  model: Model
  spaceEvent: WithEventId<SpaceEvent>
}): {
  model: Model
} => {
  const spaceId = spaceEvent.spaceId

  const space = model.spaces[spaceId] ?? Space.init

  const spaceNew = Space.appendEvent({ event: spaceEvent, model: space })

  return {
    model: {
      ...model,
      spaces: {
        ...model.spaces,
        [spaceId]: spaceNew,
      },
    },
  }
}

export const mergeMany = ({
  model,
  spaces,
}: {
  model: Model
  spaces: Space.Model[]
}): Model => {
  return spaces.reduce(
    (modelNew, space) => mergeOne({ model: modelNew, space }),
    model,
  )
}

export const mergeOne = ({
  model,
  space,
}: {
  model: Model
  space: Space.Model
}): Model => {
  const spaceState = Space.toSpaceStarted(space)

  if (!spaceState) {
    return model
  }

  const currentSpace = model.spaces[spaceState.spaceId]

  if (!currentSpace) {
    const spaceIdByUserIdNew = updateSpaceIdByUserIdFromSpaceState(
      model.spaceIdByUserId,
      space,
    )

    return {
      ...model,
      spaces: {
        ...model.spaces,
        [spaceState.spaceId]: space,
      },
      spaceIdByUserId: spaceIdByUserIdNew,
    }
  }

  const spaceNew = Space.merge(currentSpace, space)

  const spaceIdByUserIdNew = updateSpaceIdByUserIdFromSpaceState(
    model.spaceIdByUserId,
    spaceNew,
  )

  return {
    ...model,
    spaces: {
      ...model.spaces,
      [spaceState.spaceId]: spaceNew,
    },
    spaceIdByUserId: spaceIdByUserIdNew,
  }
}

const updateSpaceIdByUserIdFromSpaceState = (
  spaceIdByUserId: Model["spaceIdByUserId"],
  space: Space.Model,
): Model["spaceIdByUserId"] => {
  const spaceState = Space.toSpaceStarted(space)

  if (!spaceState) {
    return spaceIdByUserId
  }

  const spaceIdByUserIdNew = { ...spaceIdByUserId }

  spaceIdByUserIdNew[spaceState.hostId] = spaceState.spaceId

  for (const userId of SpaceState.toUserIds(spaceState)) {
    spaceIdByUserIdNew[userId] = spaceState.spaceId
  }

  return spaceIdByUserIdNew
}
