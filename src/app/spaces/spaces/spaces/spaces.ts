import { EventSourced } from '~/@/event-sourced'
import { EventId, WithEventId } from '~/@/event-sourced/event'
import { s } from '~/@/schema'
import { SpaceId } from '~/app/@/data/space-id'
import { UserId } from '~/app/@/data/user-id'
import { Space } from '../../space/space'
import { MsgSpace } from '../../space/msg-space'
import { SpaceState } from '../../space/space-state'

export const SpaceError = s.obj({
  t: s.l('user-already-in-a-space'),
  userId: UserId,
})
export type SpaceError = s.Infer<typeof SpaceError>

export const Model = s.obj({
  spaces: s.dict(SpaceId, Space.Model),
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

export const toSpaceState = (model: Model, spaceId?: SpaceId | null | undefined): SpaceState.State => {
  if (!spaceId) return SpaceState.init

  const spaceModel = model.spaces[spaceId]

  if (!spaceModel) return SpaceState.init

  const spaceState = EventSourced.toState(Space.config, spaceModel)

  return spaceState
}

export const toSpaces = (model: Model): SpaceState.Started[] => {
  const spaces: SpaceState.Started[] = []
  for (const spaceId in model.spaces) {
    const started = toSpaceStarted(model, spaceId as SpaceId)
    if (started) {
      spaces.push(started)
    }
  }
  return spaces
}

export const toSpaceStarted = (model: Model, spaceId?: SpaceId | null): SpaceState.Started | null => {
  if (!spaceId) return null

  const spaceModel = model.spaces[spaceId]

  if (!spaceModel) return null

  const spaceState = Space.toSpaceStarted(spaceModel)

  return spaceState
}

export const update = (input: {
  modelSpace: Model
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
      const userIds = Space.toUserIds(input.modelSpace.spaces[input.msgSpace.spaceId] ?? Space.init)

      const spaceIdByUserIdNew = {
        ...input.modelSpace.indexSpaceIdByUserId,
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
      const spaceId = input.modelSpace.indexSpaceIdByUserId[input.msgSpace.userId]

      if (spaceId) {
        return {
          model: {
            ...input.modelSpace,
            errors: {
              ...input.modelSpace.errors,
              [input.msgSpace.eventId]: {
                t: 'user-already-in-a-space',
                userId: input.msgSpace.userId,
              },
            },
          },
        }
      }

      const spaceIdByUserIdNew = {
        ...input.modelSpace.indexSpaceIdByUserId,
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
        ...input.modelSpace.indexSpaceIdByUserId,
      }

      if (input.msgSpace.spaceId === input.modelSpace.indexSpaceIdByUserId[input.msgSpace.userId]) {
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
        ...input.modelSpace.indexSpaceIdByUserId,
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
  modelSpace: Model
  msgSpace: WithEventId<MsgSpace>
}): {
  model: Model
} => {
  const spaceId = input.msgSpace.spaceId

  const space = input.modelSpace.spaces[spaceId] ?? Space.init

  const spaceNew = EventSourced.appendEvent(Space.config, space, input.msgSpace)

  return {
    model: {
      ...input.modelSpace,
      spaces: {
        ...input.modelSpace.spaces,
        [spaceId]: spaceNew,
      },
    },
  }
}

export const mergeOne = (model: Model, space: Space.Model): Model => {
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
  space: Space.Model,
): Model['indexSpaceIdByUserId'] => {
  const spaceState = Space.toSpaceStarted(space)

  if (!spaceState) return spaceIdByUserId

  const spaceIdByUserIdNew = { ...spaceIdByUserId }

  spaceIdByUserIdNew[spaceState.hostId] = spaceState.spaceId

  for (const userId of SpaceState.toUserIds(spaceState)) {
    spaceIdByUserIdNew[userId] = spaceState.spaceId
  }

  return spaceIdByUserIdNew
}
