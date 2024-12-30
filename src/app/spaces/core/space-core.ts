import { EventSourced, EventSourcedConfig } from '~/@/event-sourced'
import { EventId } from '~/@/event-sourced/event'
import { pipe } from '~/@/function/pipe'
import { p } from '~/@/parser'
import { SpaceId } from '~/app/@/data/space-id'
import { UserId } from '~/app/@/data/user-id'
import { SpaceEvent } from './space-event'
import { SpaceCoreState } from './space-state'

export const Model = EventSourced.parser(SpaceEvent, SpaceCoreState.State)
export type Model = p.Infer<typeof Model>

export const init: Model = EventSourced.init(SpaceCoreState.init)

export const config: EventSourcedConfig<SpaceEvent, SpaceCoreState.State> = {
  reducer: SpaceCoreState.updateCore
}

export const isEqual = (left: Model, right: Model) => EventSourced.isSameState(config, left, right)

export const random = (input?: { hostId?: UserId; spaceId?: SpaceId }) => {
  return pipe(
    init,

    (model) =>
      EventSourced.appendEvent(config, model, {
        t: 'user-started-space',
        eventId: EventId.generate(),
        spaceId: input?.spaceId ?? SpaceId.generate(),
        userId: input?.hostId ?? UserId.generate()
      })
  )
}

export const toSpaceId = (model: Model): SpaceId | null => {
  const state = EventSourced.toState(config, model)

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

export const toSpaceStarted = (model: Model | null | undefined): SpaceCoreState.Started | null => {
  if (!model) {
    return null
  }
  const state = EventSourced.toState(config, model)

  switch (state.type) {
    case 'started': {
      return state
    }
    default: {
      return null
    }
  }
}

export const toUserIds = (model: Model): UserId[] => {
  return SpaceCoreState.toUserIds(EventSourced.toState(config, model))
}
