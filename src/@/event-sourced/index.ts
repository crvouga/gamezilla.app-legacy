import { assert } from '@/assert'
import { CappedOrderedDict } from '@/capped-ordered-dict/capped-ordered-dict'
import { ascend, eq } from '@/core'
import { p } from '@/core/parser'
import { LamportClock, LamportTimestamp } from '@/lamport-clock'
import { EventId, EventMeta, type WithEventId, type WithEventMeta } from './event'

export type EventSourced<TEvent, TState> = {
  clock: LamportClock
  events: WithEventMeta<TEvent>[]
  eventIds: Record<EventId, EventId>
  snapshots: CappedOrderedDict<EventId, TState>
  initial: TState
}

export type EventSourcedConfig<TEvent, TState> = {
  reducer: (state: TState, event: WithEventMeta<TEvent>) => TState
}

const parser = <TEvent, TState>(
  eventParser: p.Parser<TEvent>,
  stateParser: p.Parser<TState>
): p.Parser<EventSourced<TEvent, TState>> => {
  return p.obj({
    events: p.arr(p.and(EventMeta, eventParser)),
    eventIds: p.dict(EventId, EventId),
    clock: LamportClock,
    snapshots: CappedOrderedDict.parser(EventId, stateParser),
    initial: stateParser
  })
}

const SNAPSHOTS_MAX_SIZE = 10

const init = <TEvent, TState>(initial: TState): EventSourced<TEvent, TState> => {
  return {
    clock: LamportClock.init,
    events: [],
    snapshots: CappedOrderedDict.init({ maxSize: SNAPSHOTS_MAX_SIZE }),
    eventIds: {},
    initial: initial
  }
}

const initFromSnapshot = <TEvent, TState>(
  snapshot: TState,
  events: WithEventMeta<TEvent>[]
): EventSourced<TEvent, TState> => {
  const initial: EventSourced<TEvent, TState> = {
    ...init(snapshot),
    events: events
  }

  for (const event of events) {
    initial.eventIds[event.eventId] = event.eventId
  }

  const latestEvent = events[events.length - 1]

  initial.clock = latestEvent?.happenedAt ? LamportClock.initFromTimestamp(latestEvent.happenedAt) : LamportClock.init

  if (latestEvent) {
    initial.snapshots = CappedOrderedDict.add(initial.snapshots, latestEvent.eventId, snapshot)
  }

  return initial
}

const isSameState = <TEvent, TState>(
  config: EventSourcedConfig<TEvent, TState>,
  left: EventSourced<TEvent, TState>,
  right: EventSourced<TEvent, TState>
) => {
  return eq(toState(config, left), toState(config, right))
}

const startFromLatestSnapshot = <TEvent, TState>(model: EventSourced<TEvent, TState>): EventSourced<TEvent, TState> => {
  const events: WithEventMeta<TEvent>[] = []
  const eventIds: EventSourced<TEvent, TState>['eventIds'] = {}

  const snapshots: EventSourced<TEvent, TState>['snapshots'] = CappedOrderedDict.init({
    maxSize: SNAPSHOTS_MAX_SIZE
  })

  for (let i = model.events.length - 1; i >= 0; i--) {
    const event = model.events[i]

    assert(event, 'Event should not be null')

    if (!event) {
      continue
    }

    const snapshot = CappedOrderedDict.get(model.snapshots, event.eventId)

    events.unshift(event)
    eventIds[event.eventId] = event.eventId

    if (snapshot) {
      return {
        eventIds: eventIds,
        events: events,
        clock: model.clock,
        snapshots: CappedOrderedDict.add(snapshots, event.eventId, snapshot),
        initial: snapshot
      }
    }
  }

  return {
    events: events,
    eventIds: eventIds,
    clock: model.clock,
    snapshots: snapshots,
    initial: model.initial
  }
}

const toLatestSnapshot = <TEvent, TState>(model: EventSourced<TEvent, TState>): TState => {
  for (let i = model.events.length - 1; i >= 0; i--) {
    const event = model.events[i]

    assert(event, 'Event should not be null')

    if (!event) {
      continue
    }

    const snapshot = CappedOrderedDict.get(model.snapshots, event.eventId)

    if (snapshot) {
      return snapshot
    }
  }

  return model.initial
}

//
//
//
//
//

const appendEvent = <TEvent, TState>(
  config: EventSourcedConfig<TEvent, TState>,
  model: EventSourced<TEvent, TState>,
  event: WithEventId<TEvent>
): EventSourced<TEvent, TState> => {
  if (model.eventIds[event.eventId]) {
    return model
  }

  //
  //
  //

  const newEvent: WithEventMeta<TEvent> = {
    ...event,
    happenedAt: LamportClock.toCurrentTime(model.clock)
  }

  let newSnapshots = { ...model.snapshots }

  const appended = [...model.events, newEvent]

  const newEvents = appended.sort(ascend((e) => LamportTimestamp.toNumber(e.happenedAt)))

  const newEventIds = {
    ...model.eventIds,
    [event.eventId]: event.eventId
  }

  //
  // Remove invalid snapshots
  //

  const newEventIndex = newEvents.findIndex((e) => e.eventId === event.eventId)

  if (newEventIndex === -1) {
    assert(false, 'Event should be found because it was just appended')
    return model
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

  const snapshot = toState(config, {
    clock: model.clock,
    events: newEvents,
    snapshots: newSnapshots,
    eventIds: newEventIds,
    initial: model.initial
  })

  newSnapshots = CappedOrderedDict.add(newSnapshots, event.eventId, snapshot)

  //
  //
  //

  const newClock = LamportClock.increment(model.clock)

  //
  //

  const modelNew: EventSourced<TEvent, TState> = {
    snapshots: newSnapshots,
    clock: newClock,
    events: newEvents,
    eventIds: newEventIds,
    initial: model.initial
  }

  //
  //
  //

  return modelNew
}

const toState = <TEvent, TState>(
  config: EventSourcedConfig<TEvent, TState>,
  model: EventSourced<TEvent, TState>
): TState => {
  let state = model.initial
  const events: WithEventMeta<TEvent>[] = []

  for (let i = model.events.length - 1; i >= 0; i--) {
    const event = model.events[i]

    if (!event) {
      assert(false, 'Event should not be null')
      continue
    }

    const snapshot = CappedOrderedDict.get(model.snapshots, event.eventId)

    if (snapshot) {
      state = snapshot
      break
    }

    events.push(event)
  }

  for (let i = events.length - 1; i >= 0; i--) {
    state = config.reducer(state, events[i]!)
  }

  return state
}

const toEvent = <TEvent, TState>(model: EventSourced<TEvent, TState>, eventId: EventId) => {
  const event = model.events.find((e) => e.eventId === eventId)

  if (!event) {
    return null
  }

  return event
}

const hasEvent = <TEvent, TState>(model: EventSourced<TEvent, TState>, eventId: EventId) => {
  return model.events.some((e) => e.eventId === eventId)
}

const mergeLeft = <TEvent, TState>(
  left: EventSourced<TEvent, TState>,
  right: EventSourced<TEvent, TState>
): EventSourced<TEvent, TState> => {
  const withoutLeft = right.events.filter((e) => !left.eventIds[e.eventId])

  const eventsNew = [...left.events, ...withoutLeft]

  eventsNew.sort(ascend((e) => LamportTimestamp.toNumber(e.happenedAt)))

  const snapshotsNew = CappedOrderedDict.mergeLeft(left.snapshots, right.snapshots)

  const clockNew = LamportClock.update(left.clock, right.clock)

  return {
    clock: clockNew,
    events: eventsNew,
    snapshots: snapshotsNew,
    eventIds: {
      ...left.eventIds,
      ...right.eventIds
    },
    initial: left.initial
  }
}

export const EventSourced = {
  parser,
  init,
  initFromSnapshot,
  isSameState,
  startFromLatestSnapshot,
  toLatestSnapshot,
  appendEvent,
  toState,
  toEvent,
  hasEvent,
  mergeLeft
}
