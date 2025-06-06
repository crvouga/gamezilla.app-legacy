import { assert } from '~/@/assert'
import { CappedOrderedDict } from '~/@/capped-ordered-dict/capped-ordered-dict'
import { eq } from '~/@/equals/equals'
import { s } from '~/@/schema'
import { LamportClock, LamportTimestamp } from '~/@/lamport-clock'
import { EventId, EventMeta, type WithEventId, type WithEventMeta } from './event'
import { ascend } from '../array/sorting'

export type EventSourced<TEvent, TProjection> = {
  clock: LamportClock
  events: WithEventMeta<TEvent>[]
  eventIds: Record<EventId, EventId>
  snapshots: CappedOrderedDict<EventId, TProjection>
  initial: TProjection
}

export type EventSourcedConfig<TEvent, TProjection> = {
  reducer: (projection: TProjection, event: WithEventMeta<TEvent>) => TProjection
}

const schema = <TEvent, TProjection>(
  eventParser: s.Schema<TEvent>,
  projectionParser: s.Schema<TProjection>,
): s.Schema<EventSourced<TEvent, TProjection>> => {
  return s.obj({
    events: s.arr(s.and(EventMeta, eventParser)),
    eventIds: s.dict(EventId, EventId),
    clock: LamportClock,
    snapshots: CappedOrderedDict.schema(EventId, projectionParser),
    initial: projectionParser,
  })
}

const SNAPSHOTS_MAX_SIZE = 10

const init = <TEvent, TProjection>(initial: TProjection): EventSourced<TEvent, TProjection> => {
  return {
    clock: LamportClock.init,
    events: [],
    snapshots: CappedOrderedDict.init({ maxSize: SNAPSHOTS_MAX_SIZE }),
    eventIds: {},
    initial: initial,
  }
}

const initFromSnapshot = <TEvent, TProjection>(
  snapshot: TProjection,
  events: WithEventMeta<TEvent>[],
): EventSourced<TEvent, TProjection> => {
  const initial: EventSourced<TEvent, TProjection> = {
    ...init(snapshot),
    events: events,
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

const isSameProjection = <TEvent, TProjection>(
  config: EventSourcedConfig<TEvent, TProjection>,
  left: EventSourced<TEvent, TProjection>,
  right: EventSourced<TEvent, TProjection>,
) => {
  return eq(toProjection(config, left), toProjection(config, right))
}

const startFromLatestSnapshot = <TEvent, TProjection>(
  model: EventSourced<TEvent, TProjection>,
): EventSourced<TEvent, TProjection> => {
  const events: WithEventMeta<TEvent>[] = []
  const eventIds: EventSourced<TEvent, TProjection>['eventIds'] = {}

  const snapshots: EventSourced<TEvent, TProjection>['snapshots'] = CappedOrderedDict.init({
    maxSize: SNAPSHOTS_MAX_SIZE,
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
        initial: snapshot,
      }
    }
  }

  return {
    events: events,
    eventIds: eventIds,
    clock: model.clock,
    snapshots: snapshots,
    initial: model.initial,
  }
}

const toLatestSnapshot = <TEvent, TProjection>(model: EventSourced<TEvent, TProjection>): TProjection => {
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

const appendEvent = <TEvent, TProjection>(
  config: EventSourcedConfig<TEvent, TProjection>,
  model: EventSourced<TEvent, TProjection>,
  event: WithEventId<TEvent>,
): EventSourced<TEvent, TProjection> => {
  if (model.eventIds[event.eventId]) {
    return model
  }

  //
  //
  //

  const newEvent: WithEventMeta<TEvent> = {
    ...event,
    happenedAt: LamportClock.toCurrentTime(model.clock),
  }

  let newSnapshots = { ...model.snapshots }

  const appended = [...model.events, newEvent]

  const newEvents = appended.sort(ascend((e) => LamportTimestamp.toNumber(e.happenedAt)))

  const newEventIds = {
    ...model.eventIds,
    [event.eventId]: event.eventId,
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

  const snapshot = toProjection(config, {
    clock: model.clock,
    events: newEvents,
    snapshots: newSnapshots,
    eventIds: newEventIds,
    initial: model.initial,
  })

  newSnapshots = CappedOrderedDict.add(newSnapshots, event.eventId, snapshot)

  //
  //
  //

  const newClock = LamportClock.increment(model.clock)

  //
  //

  const modelNew: EventSourced<TEvent, TProjection> = {
    snapshots: newSnapshots,
    clock: newClock,
    events: newEvents,
    eventIds: newEventIds,
    initial: model.initial,
  }

  //
  //
  //

  return modelNew
}

const toProjection = <TEvent, TProjection>(
  config: EventSourcedConfig<TEvent, TProjection>,
  model: EventSourced<TEvent, TProjection>,
): TProjection => {
  let projection = model.initial
  const events: WithEventMeta<TEvent>[] = []

  for (let i = model.events.length - 1; i >= 0; i--) {
    const event = model.events[i]

    if (!event) {
      assert(false, 'Event should not be null')
      continue
    }

    const snapshot = CappedOrderedDict.get(model.snapshots, event.eventId)

    if (snapshot) {
      projection = snapshot
      break
    }

    events.push(event)
  }

  for (let i = events.length - 1; i >= 0; i--) {
    projection = config.reducer(projection, events[i]!)
  }

  return projection
}

const toEvent = <TEvent, TProjection>(model: EventSourced<TEvent, TProjection>, eventId: EventId) => {
  const event = model.events.find((e) => e.eventId === eventId)

  if (!event) {
    return null
  }

  return event
}

const hasEvent = <TEvent, TProjection>(model: EventSourced<TEvent, TProjection>, eventId: EventId) => {
  return model.events.some((e) => e.eventId === eventId)
}

const mergeLeft = <TEvent, TProjection>(
  left: EventSourced<TEvent, TProjection>,
  right: EventSourced<TEvent, TProjection>,
): EventSourced<TEvent, TProjection> => {
  const withoutLeft = right.events.filter((e) => !left.eventIds[e.eventId])

  const eventsNew = [...left.events, ...withoutLeft]

  eventsNew.sort(ascend((e) => e.happenedAt))

  const snapshotsNew = CappedOrderedDict.mergeLeft(left.snapshots, right.snapshots)

  const clockNew = LamportClock.update(left.clock, right.clock)

  return {
    clock: clockNew,
    events: eventsNew,
    snapshots: snapshotsNew,
    eventIds: {
      ...left.eventIds,
      ...right.eventIds,
    },
    initial: left.initial,
  }
}

export const EventSourced = {
  schema,
  init,
  initFromSnapshot,
  isSameProjection,
  startFromLatestSnapshot,
  toLatestSnapshot,
  appendEvent,
  toProjection,
  toEvent,
  hasEvent,
  mergeLeft,
}
