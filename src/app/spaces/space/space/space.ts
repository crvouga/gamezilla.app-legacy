import { EventSourced, EventSourcedConfig } from '~/@/event-sourced'
import { EventId } from '~/@/event-sourced/event'
import { pipe } from '~/@/function/pipe'
import { s } from '~/@/schema'
import { SpaceId } from '~/app/@/data/space-id'
import { UserId } from '~/app/@/data/user-id'
import { MsgSpace } from '../msg-space'
import { SpaceProjection } from '../space-projection'

export const Model = EventSourced.schema(MsgSpace, SpaceProjection.Model)
export type Model = s.Infer<typeof Model>

export const init: Model = EventSourced.init(SpaceProjection.init)

export const config: EventSourcedConfig<MsgSpace, SpaceProjection.Model> = {
  reducer: SpaceProjection.updateSpace,
}

export const isEqual = (left: Model, right: Model) => EventSourced.isSameProjection(config, left, right)

export const random = (input?: { hostId?: UserId; spaceId?: SpaceId }) => {
  return pipe(
    init,

    (model) =>
      EventSourced.appendEvent(config, model, {
        t: 'user-started-space',
        eventId: EventId.generate(),
        spaceId: input?.spaceId ?? SpaceId.generate(),
        userId: input?.hostId ?? UserId.generate(),
      }),
  )
}

export const toSpaceId = (model: Model): SpaceId | null => {
  const state = EventSourced.toProjection(config, model)

  switch (state.type) {
    case 'ended':
    case 'started': {
      return state.spaceId
    }
    case 'initial': {
      return null
    }
  }
}

export const toSpaceStarted = (model: Model | null | undefined): SpaceProjection.Started | null => {
  if (!model) {
    return null
  }

  const state = EventSourced.toProjection(config, model)

  switch (state.type) {
    case 'started': {
      return state
    }
    default: {
      return null
    }
  }
}

export const isStarted = (model: Model | null | undefined): boolean => {
  return toSpaceStarted(model) !== null
}

export const toUserIds = (model: Model): UserId[] => {
  return SpaceProjection.toUserIds(EventSourced.toProjection(config, model))
}
