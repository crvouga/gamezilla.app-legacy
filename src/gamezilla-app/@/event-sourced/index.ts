import { CappedOrderedDict } from 'gamezilla-app/@/capped-ordered-dict/capped-ordered-dict'
import { ascend, eq } from 'gamezilla-app/@/core'
import { p } from 'gamezilla-app/@/core/parser'
import { LamportClock, LamportTimestamp } from 'gamezilla-app/@/lamport-clock'
import { EventId, EventMeta, type WithEventId, type WithEventMeta } from './event'

export type EventSourced<TEvent, TState> = {
  _clock: LamportClock
  _events: WithEventMeta<TEvent>[]
  _eventIds: Record<EventId, EventId>
  _snapshots: CappedOrderedDict<EventId, TState>
  _initial: TState
}

export type EventSourcedConfig<TEvent, TState> = {
  reducer: (state: TState, event: WithEventMeta<TEvent>) => TState
}

const parser = <TEvent, TState>(
  eventParser: p.Parser<TEvent>,
  stateParser: p.Parser<TState>
): p.Parser<EventSourced<TEvent, TState>> => {
  return p.obj({
    _events: p.arr(p.and(EventMeta, eventParser)),
    _eventIds: p.dict(EventId, EventId),
    _clock: LamportClock,
    _snapshots: CappedOrderedDict.parser(EventId, stateParser),
    _initial: stateParser
  })
}

const SNAPSHOTS_MAX_SIZE = 10

const init = <TEvent, TState>(initial: TState): EventSourced<TEvent, TState> => {
  return {
    _clock: LamportClock.init,
    _events: [],
    _snapshots: CappedOrderedDict.init({ maxSize: SNAPSHOTS_MAX_SIZE }),
    _eventIds: {},
    _initial: initial
  }
}

const initFromSnapshot = <TEvent, TState>(
  snapshot: TState,
  events: WithEventMeta<TEvent>[]
): EventSourced<TEvent, TState> => {
  const initial: EventSourced<TEvent, TState> = {
    ...init(snapshot),
    _events: events
  }

  for (const event of events) {
    initial._eventIds[event.eventId] = event.eventId
  }

  const latestEvent = events[events.length - 1]

  initial._clock = latestEvent?.happenedAt ? LamportClock.initFromTimestamp(latestEvent.happenedAt) : LamportClock.init

  if (latestEvent) {
    initial._snapshots = CappedOrderedDict.add(initial._snapshots, latestEvent.eventId, snapshot)
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
  const eventIds: EventSourced<TEvent, TState>['_eventIds'] = {}

  const snapshots: EventSourced<TEvent, TState>['_snapshots'] = CappedOrderedDict.init({
    maxSize: SNAPSHOTS_MAX_SIZE
  })

  for (let i = model._events.length - 1; i >= 0; i--) {
    const event = model._events[i]

    if (!event) {
      continue
    }

    const snapshot = CappedOrderedDict.get(model._snapshots, event.eventId)

    events.unshift(event)
    eventIds[event.eventId] = event.eventId

    if (snapshot) {
      return {
        _eventIds: eventIds,
        _events: events,
        _clock: model._clock,
        _snapshots: snapshots,
        _initial: snapshot
      }
    }
  }

  return {
    _events: events,
    _eventIds: eventIds,
    _clock: model._clock,
    _snapshots: snapshots,
    _initial: model._initial
  }
}

const toLatestSnapshot = <TEvent, TState>(model: EventSourced<TEvent, TState>): TState | null => {
  for (let i = model._events.length - 1; i >= 0; i--) {
    const event = model._events[i]

    if (!event) {
      continue
    }

    const snapshot = CappedOrderedDict.get(model._snapshots, event.eventId)

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

const appendEvent = <TEvent, TState>(
  config: EventSourcedConfig<TEvent, TState>,
  model: EventSourced<TEvent, TState>,
  event: WithEventId<TEvent>
): EventSourced<TEvent, TState> => {
  if (model._eventIds[event.eventId]) {
    return model
  }

  //
  //
  //

  const newEvent: WithEventMeta<TEvent> = {
    ...event,
    happenedAt: LamportClock.toCurrentTime(model._clock)
  }

  let newSnapshots = { ...model._snapshots }

  const appended = [...model._events, newEvent]

  const newEvents = appended.sort(ascend((e) => LamportTimestamp.toNumber(e.happenedAt)))

  const newEventIds = {
    ...model._eventIds,
    [event.eventId]: event.eventId
  }

  //
  // Remove invalid snapshots
  //

  const newEventIndex = newEvents.findIndex((e) => e.eventId === event.eventId)

  if (newEventIndex === -1) {
    // This should never happen because we just appended the event
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
    _clock: model._clock,
    _events: newEvents,
    _snapshots: newSnapshots,
    _eventIds: newEventIds,
    _initial: model._initial
  })

  newSnapshots = CappedOrderedDict.add(newSnapshots, event.eventId, snapshot)

  //
  //
  //

  const newClock = LamportClock.increment(model._clock)

  //
  //

  const modelNew: EventSourced<TEvent, TState> = {
    _snapshots: newSnapshots,
    _clock: newClock,
    _events: newEvents,
    _eventIds: newEventIds,
    _initial: model._initial
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
  let state = model._initial
  const events: WithEventMeta<TEvent>[] = []

  for (let i = model._events.length - 1; i >= 0; i--) {
    const event = model._events[i]

    if (!event) {
      continue
    }

    const snapshot = CappedOrderedDict.get(model._snapshots, event.eventId)

    if (snapshot) {
      state = snapshot
      break
    }

    events.push(event)
  }

  for (let i = 0; i < events.length; i++) {
    state = config.reducer(state, events[i]!)
  }

  return state
}

const toEvent = <TEvent, TState>(model: EventSourced<TEvent, TState>, eventId: EventId) => {
  const event = model._events.find((e) => e.eventId === eventId)

  if (!event) {
    return null
  }

  return event
}

const hasEvent = <TEvent, TState>(model: EventSourced<TEvent, TState>, eventId: EventId) => {
  return model._events.some((e) => e.eventId === eventId)
}

const mergeLeft = <TEvent, TState>(
  left: EventSourced<TEvent, TState>,
  right: EventSourced<TEvent, TState>
): EventSourced<TEvent, TState> => {
  const withoutLeft = right._events.filter((e) => !left._eventIds[e.eventId])

  const eventsNew = [...left._events, ...withoutLeft]

  eventsNew.sort(ascend((e) => LamportTimestamp.toNumber(e.happenedAt)))

  const snapshotsNew = CappedOrderedDict.mergeLeft(left._snapshots, right._snapshots)

  const clockNew = LamportClock.update(left._clock, right._clock)

  return {
    _clock: clockNew,
    _events: eventsNew,
    _snapshots: snapshotsNew,
    _eventIds: {
      ...left._eventIds,
      ...right._eventIds
    },
    _initial: left._initial
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
  deriveState: toState,
  toEventWithMeta: toEvent,
  hasEvent,
  mergeLeft
}
