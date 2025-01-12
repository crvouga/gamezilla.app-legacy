import { EventSourced } from '~/@/event-sourced'
import { EventId, WithEventId } from '~/@/event-sourced/event'
import { p } from '~/@/parser'
import { SpaceId } from '~/app/@/data/space-id'
import { UserId } from '~/app/@/data/user-id'
import { SpaceCore } from '../space-core'
import type { SpaceEvent } from '../space-event'
import { SpaceCoreState } from '../space-state'

//
//
//
//
//
//

export const SpaceError = p.obj({
  t: p.l('user-already-in-a-space'),
  userId: UserId,
})
export type SpaceError = p.Infer<typeof SpaceError>

export const Model = p.obj({
  spaces: p.dict(SpaceId, SpaceCore.Model),
  indexSpaceIdByUserId: p.dict(UserId, SpaceId),
  errors: p.dict(EventId, SpaceError),
})
export type Model = p.Infer<typeof Model>

export const init: Model = {
  spaces: {},
  indexSpaceIdByUserId: {},
  errors: {},
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
  whereAnd,
}: {
  model: Model
  limit: number
  offset: number
  whereAnd?: {
    spaceId?: SpaceId
  }
  sort?: 'newest' | 'oldest'
}): SpaceCore.Model[] => {
  if (whereAnd?.spaceId) {
    const space = model.spaces[whereAnd.spaceId]

    if (!space) {
      return []
    }

    return [space]
  }

  const spaces: SpaceCore.Model[] = []

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

    const spaceState = EventSourced.toState(SpaceCore.config, spaceModel)

    switch (spaceState.type) {
      case 'ended': {
        break
      }
      case 'initial': {
        break
      }
      case 'started': {
        const started = EventSourced.startFromLatestSnapshot(spaceModel)
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
  return userId ? (model.indexSpaceIdByUserId[userId] ?? null) : null
}

export const toSpace = (model: Model, spaceId: SpaceId): SpaceCore.Model | null => {
  return model.spaces[spaceId] ?? null
}

export const toErrorByEvenId = (model: Model, eventId: EventId): SpaceError | null => {
  return model.errors[eventId] ?? null
}

export const hasEvent = (model: Model, spaceId: SpaceId, eventId: EventId): boolean => {
  const space = toSpace(model, spaceId)
  return Boolean(space && EventSourced.hasEvent(space, eventId))
}

export const toSpaceByUserId = ({ model, userId }: { model: Model; userId: UserId }): SpaceCore.Model | null => {
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

  return EventSourced.toEvent(space, msgEvtId)
}

export const toSpaceState = (model: Model, spaceId?: SpaceId | null | undefined): SpaceCoreState.State => {
  if (!spaceId) {
    return SpaceCoreState.init
  }

  const spaceModel = model.spaces[spaceId]

  if (!spaceModel) {
    return SpaceCoreState.init
  }

  const spaceState = EventSourced.toState(SpaceCore.config, spaceModel)

  return spaceState
}

export const toSpaceStarted = (model: Model, spaceId?: SpaceId | null): SpaceCoreState.Started | null => {
  if (!spaceId) {
    return null
  }

  const spaceModel = model.spaces[spaceId]

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

export const update = ({
  model,
  msgCore,
}: {
  model: Model
  msgCore: WithEventId<SpaceEvent>
}): {
  model: Model
} => {
  switch (msgCore.t) {
    case 'game': {
      return append(model, msgCore)
    }

    case 'user-inputted-game': {
      return append(model, msgCore)
    }

    case 'user-ended-space': {
      const userIds = SpaceCore.toUserIds(model.spaces[msgCore.spaceId] ?? SpaceCore.init)

      const spaceIdByUserIdNew = {
        ...model.indexSpaceIdByUserId,
      }
      for (const userId of userIds) {
        delete spaceIdByUserIdNew[userId]
      }

      const appended = append(model, msgCore)

      return {
        model: {
          ...appended.model,
          indexSpaceIdByUserId: spaceIdByUserIdNew,
        },
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
                userId: msgCore.userId,
              },
            },
          },
        }
      }

      const spaceIdByUserIdNew = {
        ...model.indexSpaceIdByUserId,
        [msgCore.userId]: msgCore.spaceId,
      }

      const appended = append(model, msgCore)

      return {
        model: {
          ...appended.model,
          indexSpaceIdByUserId: spaceIdByUserIdNew,
        },
      }
    }

    case 'user-left-space': {
      const spaceIdByUserIdNew = {
        ...model.indexSpaceIdByUserId,
      }

      if (msgCore.spaceId === model.indexSpaceIdByUserId[msgCore.userId]) {
        delete spaceIdByUserIdNew[msgCore.userId]
      }

      const appended = append(model, msgCore)

      return {
        model: {
          ...appended.model,
          indexSpaceIdByUserId: spaceIdByUserIdNew,
        },
      }
    }

    case 'user-started-space': {
      const spaceIdByUserIdNew = {
        ...model.indexSpaceIdByUserId,
        [msgCore.userId]: msgCore.spaceId,
      }

      const appended = append(model, msgCore)

      return {
        model: {
          ...appended.model,
          indexSpaceIdByUserId: spaceIdByUserIdNew,
        },
      }
    }
  }
}

const append = (
  model: Model,
  msgCore: WithEventId<SpaceEvent>,
): {
  model: Model
} => {
  const spaceId = msgCore.spaceId

  const space = model.spaces[spaceId] ?? SpaceCore.init

  const spaceNew = EventSourced.appendEvent(SpaceCore.config, space, msgCore)

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

export const merge = (model: Model, space: SpaceCore.Model): Model => {
  const spaceId = SpaceCore.toSpaceId(space)

  const maybeCurrentSpace = spaceId ? model.spaces[spaceId] : null

  const currentSpace = maybeCurrentSpace ?? SpaceCore.init

  const spaceNew = EventSourced.mergeLeft(currentSpace, space)

  const indexSpaceIdByUserIdNew = updateIndexSpaceIdByUserId(model.indexSpaceIdByUserId, spaceNew)

  const spacesNew: Model['spaces'] = spaceId
    ? {
        ...model.spaces,
        [spaceId]: spaceNew,
      }
    : model.spaces

  return {
    ...model,
    spaces: spacesNew,
    indexSpaceIdByUserId: indexSpaceIdByUserIdNew,
  }
}

const updateIndexSpaceIdByUserId = (
  spaceIdByUserId: Model['indexSpaceIdByUserId'],
  space: SpaceCore.Model,
): Model['indexSpaceIdByUserId'] => {
  const spaceState = SpaceCore.toSpaceStarted(space)

  if (!spaceState) {
    return spaceIdByUserId
  }

  const spaceIdByUserIdNew = { ...spaceIdByUserId }

  spaceIdByUserIdNew[spaceState.hostId] = spaceState.spaceId

  for (const userId of SpaceCoreState.toUserIds(spaceState)) {
    spaceIdByUserIdNew[userId] = spaceState.spaceId
  }

  return spaceIdByUserIdNew
}
