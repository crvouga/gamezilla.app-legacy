import { CappedOrderedDict } from 'gamezilla-app/@/capped-ordered-dict/capped-ordered-dict'
import { ascend, eq, pipe } from 'gamezilla-app/@/core'
import { p } from 'gamezilla-app/@/core/parser'
import { LamportClock, LamportTimestamp } from 'gamezilla-app/@/lamport-clock'
import { SpaceId, UserId } from 'gamezilla-app/app/@/data'
import { EventId, EventMeta, type WithEventId, type WithEventMeta } from '../@/event'
import { MsgCore } from './space-core-event'
import * as SpaceState from './space-core-state'

//
//
//
//
//
//

export const Model = p.obj({
  events: p.arr(p.and(EventMeta, MsgCore)),
  eventIds: p.dict(EventId, EventId),
  clock: LamportClock,
  snapshots: CappedOrderedDict.parser(EventId, SpaceState.State)
})

export type Model = p.Infer<typeof Model>

export const init: Model = {
  clock: LamportClock.init,
  events: [],
  snapshots: CappedOrderedDict.init({ maxSize: 10 }),
  eventIds: {}
}

export const initFromSnapshot = (input: { snapshot: SpaceState.State; events: WithEventMeta<MsgCore>[] }): Model => {
  const initial: Model = { ...init, events: input.events }

  for (const event of input.events) {
    initial.eventIds[event.eventId] = event.eventId
  }

  const latestEvent = input.events[input.events.length - 1]

  initial.clock = latestEvent?.happenedAt ? LamportClock.initFromTimestamp(latestEvent.happenedAt) : LamportClock.init

  if (latestEvent) {
    initial.snapshots = CappedOrderedDict.add(initial.snapshots, latestEvent.eventId, input.snapshot)
  }

  return {
    ...initial
  }
}

export const isEqual = (left: Model, right: Model) => {
  return eq(deriveState(left), deriveState(right))
}

//
//
//
//
//
//

export const random = (input?: { hostId?: UserId; spaceId?: SpaceId }) => {
  return pipe(
    init,
    //
    (model) =>
      appendEvent({
        model,
        msgCore: {
          t: 'user-started-space',
          eventId: EventId.generate(),
          spaceId: input?.spaceId ?? SpaceId.generate(),
          userId: input?.hostId ?? UserId.generate()
        }
      })
  )
}

//
//
//
//
//
//

export const startFromLatestSnapshot = (model: Model): Model => {
  const events: WithEventMeta<MsgCore>[] = []
  const eventIds: Model['eventIds'] = {}

  for (let i = model.events.length - 1; i >= 0; i--) {
    const event = model.events[i]

    if (!event) {
      continue
    }

    const snapshot = CappedOrderedDict.get(model.snapshots, event.eventId)

    events.unshift(event)
    eventIds[event.eventId] = event.eventId

    if (snapshot) {
      return {
        eventIds,
        events,
        clock: model.clock,
        snapshots: CappedOrderedDict.add(init.snapshots, event.eventId, snapshot)
      }
    }
  }

  return {
    events,
    eventIds,
    clock: model.clock,
    snapshots: init.snapshots
  }
}

export const toLatestSnapshot = (model: Model): SpaceState.State | null => {
  for (let i = model.events.length - 1; i >= 0; i--) {
    const event = model.events[i]

    if (!event) {
      continue
    }

    const snapshot = CappedOrderedDict.get(model.snapshots, event.eventId)

    if (snapshot) {
      return snapshot
    }
  }

  return null
}

//
//
//
//
//

export const appendEvent = (input: { model: Model; msgCore: WithEventId<MsgCore> }): Model => {
  if (input.model.eventIds[input.msgCore.eventId]) {
    return input.model
  }

  //
  //
  //

  const newEvent: WithEventMeta<MsgCore> = {
    ...input.msgCore,
    happenedAt: LamportClock.toCurrentTime(input.model.clock)
  }

  let newSnapshots = { ...input.model.snapshots }

  const appended = [...input.model.events, newEvent]

  const newEvents = appended.sort(ascend((e) => LamportTimestamp.toNumber(e.happenedAt)))

  const newEventIds = {
    ...input.model.eventIds,
    [input.msgCore.eventId]: input.msgCore.eventId
  }

  //
  // Remove invalid snapshots
  //

  const newEventIndex = newEvents.findIndex((e) => e.eventId === input.msgCore.eventId)

  if (newEventIndex === -1) {
    // This should never happen because we just appended the event
    return input.model
  }

  for (let i = newEventIndex; i < newEvents.length; i++) {
    const eventId = newEvents[i]?.eventId
    if (eventId) {
      newSnapshots = CappedOrderedDict.remove(newSnapshots, eventId)
    }
  }

  //
  // Add new snapshot
  //

  const snapshot = deriveState({
    clock: input.model.clock,
    events: newEvents,
    snapshots: newSnapshots,
    eventIds: newEventIds
  })

  newSnapshots = CappedOrderedDict.add(newSnapshots, input.msgCore.eventId, snapshot)

  //
  //
  //

  const newClock = LamportClock.increment(input.model.clock)

  //
  //

  const modelNew: Model = {
    snapshots: newSnapshots,
    clock: newClock,
    events: newEvents,
    eventIds: newEventIds
  }

  //
  //
  //

  return modelNew
}

export const deriveState = (model: Model): SpaceState.State => {
  //
  //
  //

  let running = SpaceState.init

  const events: WithEventMeta<MsgCore>[] = []

  for (let i = model.events.length - 1; i >= 0; i--) {
    const event = model.events[i]

    if (!event) {
      continue
    }

    const snapshot = CappedOrderedDict.get(model.snapshots, event.eventId)

    if (snapshot) {
      running = snapshot
      break
    }

    events.push(event)
  }

  //
  //
  //

  for (const event of events) {
    running = SpaceState.updateCore({
      state: running,
      msgSpace: event
    })
  }

  return running
}

export const toEventWithMeta = (model: Model, eventId: EventId) => {
  const event = model.events.find((e) => e.eventId === eventId)

  if (!event) {
    return null
  }

  return event
}

export const hasEvent = (model: Model, msgEvtId: EventId) => {
  return model.events.some((e) => e.eventId === msgEvtId)
}

export const toSpaceId = (model: Model): SpaceId | null => {
  const state = deriveState(model)

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
  const state = deriveState(model)

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
  return SpaceState.toUserIds(deriveState(model))
}

export const mergeLeft = (left: Model, right: Model): Model => {
  const eventsNew: Model['events'] = [...left.events, ...right.events].sort(
    ascend((e) => LamportTimestamp.toNumber(e.happenedAt))
  )

  const distinctEvents = eventsNew.filter(
    (event, index, self) => index === self.findIndex((e) => e.eventId === event.eventId)
  )

  const snapshots = CappedOrderedDict.mergeLeft(left.snapshots, right.snapshots)

  const clock = LamportClock.update(left.clock, right.clock)

  return {
    clock,
    events: distinctEvents,
    snapshots,
    eventIds: {
      ...left.eventIds,
      ...right.eventIds
    }
  }
}
