import { EventSourced } from '~/@/event-sourced'
import { EventId, WithEventId } from '~/@/event-sourced/event'
import { p } from '~/@/parser'
import { SpaceId } from '~/app/@/data/space-id'
import { UserId } from '~/app/@/data/user-id'
import { Space } from '../space'
import type { SpaceEvent } from '../space-event'
import { SpaceState } from '../space-state'

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
  spaces: p.dict(SpaceId, Space.Model),
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

    const spaceState = EventSourced.toState(Space.config, spaceModel)

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

export const toSpace = (model: Model, spaceId: SpaceId): Space.Model | null => {
  return model.spaces[spaceId] ?? null
}

export const toErrorByEvenId = (model: Model, eventId: EventId): SpaceError | null => {
  return model.errors[eventId] ?? null
}

export const hasEvent = (model: Model, spaceId: SpaceId, eventId: EventId): boolean => {
  const space = toSpace(model, spaceId)
  return Boolean(space && EventSourced.hasEvent(space, eventId))
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

  return EventSourced.toEvent(space, msgEvtId)
}

export const toSpaceState = (model: Model, spaceId?: SpaceId | null | undefined): SpaceState.State => {
  if (!spaceId) {
    return SpaceState.init
  }

  const spaceModel = model.spaces[spaceId]

  if (!spaceModel) {
    return SpaceState.init
  }

  const spaceState = EventSourced.toState(Space.config, spaceModel)

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

export const update = (input: {
  model: Model
  msgSpace: WithEventId<SpaceEvent>
}): {
  model: Model
} => {
  switch (input.msgSpace.t) {
    case 'game': {
      return append(input)
    }

    case 'user-inputted-game': {
      return append(input)
    }

    case 'user-ended-space': {
      const userIds = Space.toUserIds(input.model.spaces[input.msgSpace.spaceId] ?? Space.init)

      const spaceIdByUserIdNew = {
        ...input.model.indexSpaceIdByUserId,
      }
      for (const userId of userIds) {
        delete spaceIdByUserIdNew[userId]
      }

      const appended = append(input)

      return {
        model: {
          ...appended.model,
          indexSpaceIdByUserId: spaceIdByUserIdNew,
        },
      }
    }

    case 'user-joined-space': {
      const spaceId = input.model.indexSpaceIdByUserId[input.msgSpace.userId]

      if (spaceId) {
        return {
          model: {
            ...input.model,
            errors: {
              ...input.model.errors,
              [input.msgSpace.eventId]: {
                t: 'user-already-in-a-space',
                userId: input.msgSpace.userId,
              },
            },
          },
        }
      }

      const spaceIdByUserIdNew = {
        ...input.model.indexSpaceIdByUserId,
        [input.msgSpace.userId]: input.msgSpace.spaceId,
      }

      const appended = append(input)

      return {
        model: {
          ...appended.model,
          indexSpaceIdByUserId: spaceIdByUserIdNew,
        },
      }
    }

    case 'user-left-space': {
      const spaceIdByUserIdNew = {
        ...input.model.indexSpaceIdByUserId,
      }

      if (input.msgSpace.spaceId === input.model.indexSpaceIdByUserId[input.msgSpace.userId]) {
        delete spaceIdByUserIdNew[input.msgSpace.userId]
      }

      const appended = append(input)

      return {
        model: {
          ...appended.model,
          indexSpaceIdByUserId: spaceIdByUserIdNew,
        },
      }
    }

    case 'user-started-space': {
      const spaceIdByUserIdNew = {
        ...input.model.indexSpaceIdByUserId,
        [input.msgSpace.userId]: input.msgSpace.spaceId,
      }

      const appended = append(input)

      return {
        model: {
          ...appended.model,
          indexSpaceIdByUserId: spaceIdByUserIdNew,
        },
      }
    }
  }
}

const append = (input: {
  model: Model
  msgSpace: WithEventId<SpaceEvent>
}): {
  model: Model
} => {
  const spaceId = input.msgSpace.spaceId

  const space = input.model.spaces[spaceId] ?? Space.init

  const spaceNew = EventSourced.appendEvent(Space.config, space, input.msgSpace)

  return {
    model: {
      ...input.model,
      spaces: {
        ...input.model.spaces,
        [spaceId]: spaceNew,
      },
    },
  }
}

export const merge = (model: Model, space: Space.Model): Model => {
  const spaceId = Space.toSpaceId(space)

  const maybeCurrentSpace = spaceId ? model.spaces[spaceId] : null

  const currentSpace = maybeCurrentSpace ?? Space.init

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
  space: Space.Model,
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
