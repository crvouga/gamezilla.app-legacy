import { SpaceId, UserId } from 'gamezilla-app/app/@/data'
import { EventId, type WithEventId } from '../../@/event'
import * as SpaceState from '../space-core-state'
import * as Space from '../space-core'
import type { MsgCore } from '../space-core-event'
import { p } from 'gamezilla-app/@/core/parser'

//
//
//
//
//
//

export const SpaceError = p.obj({
  t: p.l('user-already-in-a-space'),
  userId: UserId
})
export type SpaceError = p.Infer<typeof SpaceError>

export const Model = p.obj({
  spaces: p.dict(SpaceId, Space.Model),
  indexSpaceIdByUserId: p.dict(UserId, SpaceId),
  errors: p.dict(EventId, SpaceError)
})
export type Model = p.Infer<typeof Model>

export const init: Model = {
  spaces: {},
  indexSpaceIdByUserId: {},
  errors: {}
}

//
//
//
//
//
//

export const listSpaces = ({
  model,
  limit,
  offset,
  whereAnd
}: {
  model: Model
  limit: number
  offset: number
  whereAnd?: {
    spaceId?: SpaceId
  }
  sort?: 'newest' | 'oldest'
}): Space.Model[] => {
  if (whereAnd?.spaceId) {
    const space = model.spaces[whereAnd.spaceId]

    if (!space) {
      return []
    }

    return [space]
  }

  const spaces: Space.Model[] = []

  let i = -1
  for (const spaceId in model.spaces) {
    i += 1

    if (i < offset) {
      continue
    }

    const spaceModel = model.spaces[spaceId as SpaceId]

    if (!spaceModel) {
      continue
    }

    const spaceState = Space.deriveState(spaceModel)

    switch (spaceState.type) {
      case 'ended': {
        break
      }
      case 'initial': {
        break
      }
      case 'started': {
        const started = Space.startFromLatestSnapshot(spaceModel)
        spaces.push(started)
        break
      }
    }

    if (spaces.length >= limit) {
      break
    }
  }

  return spaces
}

export const toSpaceIdByUserId = (model: Model, userId: UserId | null | undefined): SpaceId | null => {
  return userId ? model.indexSpaceIdByUserId[userId] ?? null : null
}

export const toSpace = (model: Model, spaceId: SpaceId): Space.Model | null => {
  return model.spaces[spaceId] ?? null
}

export const toErrorByEvenId = (model: Model, eventId: EventId): SpaceError | null => {
  return model.errors[eventId] ?? null
}

export const hasEvent = (model: Model, spaceId: SpaceId, eventId: EventId): boolean => {
  const space = toSpace(model, spaceId)
  return Boolean(space && Space.hasEvent(space, eventId))
}

export const toSpaceByUserId = ({ model, userId }: { model: Model; userId: UserId }): Space.Model | null => {
  const spaceId = model.indexSpaceIdByUserId[userId]

  if (!spaceId) {
    return null
  }

  const space = model.spaces[spaceId]

  if (!space) {
    return null
  }

  return space
}

export const toEventWithMeta = (model: Model, spaceId: SpaceId, msgEvtId?: EventId | null) => {
  if (!msgEvtId) {
    return null
  }

  const space = model.spaces[spaceId]

  if (!space) {
    return null
  }

  return Space.toEventWithMeta(space, msgEvtId)
}

export const toSpaceState = (model: Model, spaceId?: SpaceId | null | undefined): SpaceState.State => {
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

export const toSpaceStarted = (model: Model, spaceId?: SpaceId | null): SpaceState.Started | null => {
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

export const update = ({
  model,
  msgCore
}: {
  model: Model
  msgCore: WithEventId<MsgCore>
}): {
  model: Model
} => {
  if (hasEvent(model, msgCore.spaceId, msgCore.eventId)) {
    return { model }
  }

  switch (msgCore.t) {
    case 'game': {
      return append(model, msgCore)
    }

    case 'user-inputted-game': {
      return append(model, msgCore)
    }

    case 'user-ended-space': {
      const userIds = Space.toUserIds(model.spaces[msgCore.spaceId] ?? Space.init)

      const spaceIdByUserIdNew = {
        ...model.indexSpaceIdByUserId
      }
      for (const userId of userIds) {
        delete spaceIdByUserIdNew[userId]
      }

      const appended = append(model, msgCore)

      return {
        model: {
          ...appended.model,
          indexSpaceIdByUserId: spaceIdByUserIdNew
        }
      }
    }

    case 'user-joined-space': {
      const spaceId = model.indexSpaceIdByUserId[msgCore.userId]

      if (spaceId) {
        return {
          model: {
            ...model,
            errors: {
              ...model.errors,
              [msgCore.eventId]: {
                t: 'user-already-in-a-space',
                userId: msgCore.userId
              }
            }
          }
        }
      }

      const spaceIdByUserIdNew = {
        ...model.indexSpaceIdByUserId,
        [msgCore.userId]: msgCore.spaceId
      }

      const appended = append(model, msgCore)

      return {
        model: {
          ...appended.model,
          indexSpaceIdByUserId: spaceIdByUserIdNew
        }
      }
    }

    case 'user-left-space': {
      const spaceIdByUserIdNew = {
        ...model.indexSpaceIdByUserId
      }

      if (msgCore.spaceId === model.indexSpaceIdByUserId[msgCore.userId]) {
        delete spaceIdByUserIdNew[msgCore.userId]
      }

      const appended = append(model, msgCore)

      return {
        model: {
          ...appended.model,
          indexSpaceIdByUserId: spaceIdByUserIdNew
        }
      }
    }

    case 'user-started-space': {
      const spaceIdByUserIdNew = {
        ...model.indexSpaceIdByUserId,
        [msgCore.userId]: msgCore.spaceId
      }

      const appended = append(model, msgCore)

      return {
        model: {
          ...appended.model,
          indexSpaceIdByUserId: spaceIdByUserIdNew
        }
      }
    }
  }
}

const append = (
  model: Model,
  msgCore: WithEventId<MsgCore>
): {
  model: Model
} => {
  const spaceId = msgCore.spaceId

  const space = model.spaces[spaceId] ?? Space.init

  const spaceNew = Space.appendEvent({
    msgCore: msgCore,
    model: space
  })

  return {
    model: {
      ...model,
      spaces: {
        ...model.spaces,
        [spaceId]: spaceNew
      }
    }
  }
}

export const merge = (model: Model, space: Space.Model): Model => {
  const spaceId = Space.toSpaceId(space)

  const maybeCurrentSpace = spaceId ? model.spaces[spaceId] : null

  const currentSpace = maybeCurrentSpace ?? Space.init

  const spaceNew = Space.mergeLeft(currentSpace, space)

  const indexSpaceIdByUserIdNew = updateIndexSpaceIdByUserId(model.indexSpaceIdByUserId, spaceNew)

  const spacesNew: Model['spaces'] = spaceId
    ? {
        ...model.spaces,
        [spaceId]: spaceNew
      }
    : model.spaces

  return {
    ...model,
    spaces: spacesNew,
    indexSpaceIdByUserId: indexSpaceIdByUserIdNew
  }
}

const updateIndexSpaceIdByUserId = (
  spaceIdByUserId: Model['indexSpaceIdByUserId'],
  space: Space.Model
): Model['indexSpaceIdByUserId'] => {
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
