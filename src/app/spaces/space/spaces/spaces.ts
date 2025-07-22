import { EventSourced } from '~/@/event-sourced'
import { EventId, WithEventId } from '~/@/event-sourced/event'
import { s } from '~/@/schema'
import { SpaceId } from '~/app/@/data/space-id'
import { UserId } from '~/app/@/data/user-id'
import { MsgSpace } from '../msg-space'
import { Space } from '../space/space'
import { SpaceProjection, SpaceProjectionStarted } from '../space/space-projection'

export const SpaceError = s.obj({
  t: s.l('user-already-in-a-space'),
  userId: UserId,
})
export type SpaceError = s.Infer<typeof SpaceError>

export const Model = s.obj({
  spaces: s.dict(SpaceId, Space.schema),
  indexSpaceIdByUserId: s.dict(UserId, SpaceId),
  errors: s.dict(EventId, SpaceError),
})
export type Model = s.Infer<typeof Model>

export const init: Model = {
  spaces: {},
  indexSpaceIdByUserId: {},
  errors: {},
}

export const toSpaceIdByUserId = (model: Model, userId: UserId | null | undefined): SpaceId | null => {
  return userId ? (model.indexSpaceIdByUserId[userId] ?? null) : null
}

export const toSpace = (model: Model, spaceId: SpaceId): Space | null => {
  return model.spaces[spaceId] ?? null
}

export const toErrorByEvenId = (model: Model, eventId: EventId): SpaceError | null => {
  return model.errors[eventId] ?? null
}

export const hasEvent = (model: Model, spaceId: SpaceId, eventId: EventId): boolean => {
  const space = toSpace(model, spaceId)
  return Boolean(space && EventSourced.hasEvent(space, eventId))
}

export const toSpaceByUserId = ({ model, userId }: { model: Model; userId: UserId }): Space | null => {
  const spaceId = model.indexSpaceIdByUserId[userId]

  if (!spaceId) return null

  const space = model.spaces[spaceId]

  if (!space) return null

  return space
}

export const toEventWithMeta = (model: Model, spaceId: SpaceId, eventId?: EventId | null) => {
  if (!eventId) return null

  const space = model.spaces[spaceId]

  if (!space) return null

  return EventSourced.toEvent(space, eventId)
}

export const toSpaceProjection = (model: Model, spaceId?: SpaceId | null | undefined): SpaceProjection => {
  if (!spaceId) return SpaceProjection.init

  const spaceModel = model.spaces[spaceId]

  if (!spaceModel) return SpaceProjection.init

  const spaceState = Space.toSpaceProjection(spaceModel)

  return spaceState
}

export const toSpaceProjections = (model: Model): SpaceProjectionStarted[] => {
  const spaces: SpaceProjectionStarted[] = []
  for (const spaceId in model.spaces) {
    const started = toSpaceStarted(model, spaceId as SpaceId)
    if (started) {
      spaces.push(started)
    }
  }
  return spaces
}

export const toSpaceStarted = (model: Model, spaceId?: SpaceId | null): SpaceProjectionStarted | null => {
  if (!spaceId) return null

  const spaceModel = model.spaces[spaceId]

  if (!spaceModel) return null

  const spaceState = Space.toSpaceStarted(spaceModel)

  return spaceState
}

export const update = (input: {
  model: Model
  msgSpace: WithEventId<MsgSpace>
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
  msgSpace: WithEventId<MsgSpace>
}): {
  model: Model
} => {
  const spaceId = input.msgSpace.spaceId

  const space = input.model.spaces[spaceId] ?? Space.init

  const spaceNew = Space.append(space, input.msgSpace)

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

export const merge = (model: Model, spaces: Space[]): Model => {
  return spaces.reduce(mergeOne, model)
}

const mergeOne = (model: Model, space: Space): Model => {
  const spaceId = Space.toSpaceId(space)

  const maybeCurrentSpace = spaceId ? model.spaces[spaceId] : null

  const currentSpace = maybeCurrentSpace ?? Space.init

  const spaceNew = EventSourced.mergeLeft(currentSpace, space)

  const indexSpaceIdByUserIdNew = updateIndexSpaceIdByUserId(model.indexSpaceIdByUserId, spaceNew)

  const spacesNew: Model['spaces'] = spaceId ? { ...model.spaces, [spaceId]: spaceNew } : model.spaces

  return {
    ...model,
    spaces: spacesNew,
    indexSpaceIdByUserId: indexSpaceIdByUserIdNew,
  }
}

const updateIndexSpaceIdByUserId = (
  spaceIdByUserId: Model['indexSpaceIdByUserId'],
  space: Space,
): Model['indexSpaceIdByUserId'] => {
  const spaceState = Space.toSpaceStarted(space)

  if (!spaceState) return spaceIdByUserId

  const spaceIdByUserIdNew = { ...spaceIdByUserId }

  spaceIdByUserIdNew[spaceState.hostId] = spaceState.spaceId

  for (const userId of SpaceProjection.toUserIds(spaceState)) {
    spaceIdByUserIdNew[userId] = spaceState.spaceId
  }

  return spaceIdByUserIdNew
}
