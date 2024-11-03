import { pipe } from 'gamezilla-app/@/core'
import { p } from 'gamezilla-app/@/core/parser'
import { EventSourced, EventSourcedConfig } from 'gamezilla-app/@/event-sourced'
import { EventId } from 'gamezilla-app/@/event-sourced/event'
import { SpaceId, UserId } from 'gamezilla-app/app/@/data'
import { MsgCore } from './event'
import * as SpaceState from './space-state'

export const Model = EventSourced.parser(MsgCore, SpaceState.State)
export type Model = p.Infer<typeof Model>

export const init: Model = EventSourced.init(SpaceState.init)

export const config: EventSourcedConfig<MsgCore, SpaceState.State> = {
  reducer: SpaceState.updateCore
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

export const toSpaceStarted = (model: Model | null | undefined): SpaceState.Started | null => {
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
  return SpaceState.toUserIds(EventSourced.toState(config, model))
}
