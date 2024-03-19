import { SpaceId, UserId } from "gamezilla-app/@CHILD/app/@SHARED/data"
import { ascend, eq } from "gamezilla-app/@SHARED/core"
import {
  LamportClock,
  LamportTimestamp,
} from "gamezilla-app/@SHARED/lamport-clock"
import { P as P } from "gamezilla-app/@SHARED/parsing"
import { EventId, WithEventId, WithEventMeta } from "../@SHARED/event"
import { SpaceEvent } from "./space-event"
import * as SpaceState from "./space-state"

//
//
//
//
//
//

export type Model = {
  events: WithEventMeta<SpaceEvent>[]
  eventIds: {
    [eventId: EventId]: EventId
  }
  clock: LamportClock
  snapshots: {
    [eventId: EventId]: SpaceState.State
  }
}

export const isModel: (x: unknown) => x is Model = P.obj({
  events: P.arr(P.any),
  eventIds: P.dict(EventId.is, EventId.is),
  clock: LamportClock.is,
  snapshots: P.dict(EventId.is, P.any),
})

export const init: Model = {
  clock: LamportClock.init,
  events: [],
  snapshots: {},
  eventIds: {},
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

export const startFromLatestSnapshot = (model: Model): Model => {
  const events: WithEventMeta<SpaceEvent>[] = []

  for (let i = model.events.length - 1; i >= 0; i--) {
    const event = model.events[i]!

    const snapshot = model.snapshots[event.eventId]

    events.unshift(event)

    if (snapshot) {
      return {
        eventIds: events.reduce<Model["eventIds"]>(
          (acc, event) => ({ ...acc, [event.eventId]: event.eventId }),
          {},
        ),
        clock: model.clock,
        events: events,
        snapshots: {
          [event.eventId]: snapshot,
        },
      }
    }
  }

  return {
    clock: model.clock,
    events: events,
    snapshots: {},
    eventIds: events.reduce<Model["eventIds"]>(
      (acc, event) => ({ ...acc, [event.eventId]: event.eventId }),
      {},
    ),
  }
}

//
//
//
//
//

export const appendEvent = ({
  model,
  event,
}: {
  model: Model
  event: WithEventId<SpaceEvent>
}): Model => {
  if (model.eventIds[event.eventId]) {
    return model
  }

  //
  //
  //

  const newEvent: WithEventMeta<SpaceEvent> = {
    ...event,
    happenedAt: LamportClock.toCurrentTime(model.clock),
  }

  const newSnapshots = { ...model.snapshots }

  const appended = [...model.events, newEvent]

  const newEvents = appended.sort(
    ascend((e) => LamportTimestamp.toNumber(e.happenedAt)),
  )

  const newEventIds = {
    ...model.eventIds,
    [event.eventId]: event.eventId,
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
    const event = newEvents[i]!.eventId
    delete newSnapshots[event]
    continue
  }

  //
  // Add new snapshot
  //

  const snapshot = deriveState({
    clock: model.clock,
    events: newEvents,
    snapshots: newSnapshots,
    eventIds: newEventIds,
  })

  newSnapshots[event.eventId] = snapshot

  //
  //
  //

  const newClock = LamportClock.increment(model.clock)

  //
  //

  const modelNew: Model = {
    snapshots: newSnapshots,
    clock: newClock,
    events: newEvents,
    eventIds: newEventIds,
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

  const events: WithEventMeta<SpaceEvent>[] = []

  for (let i = model.events.length - 1; i >= 0; i--) {
    const event = model.events[i]!

    const snapshot = model.snapshots[event.eventId]

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
    running = SpaceState.reducer({ state: running, msgSpace: event })
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
    case "ended":
    case "started": {
      return state.spaceId
    }
    case "initial": {
      return null
    }
  }
}

export const toSpaceStarted = (model: Model): SpaceState.Started | null => {
  const state = deriveState(model)

  switch (state.type) {
    case "started": {
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

export const merge = (left: Model, right: Model): Model => {
  const eventsNew: Model["events"] = [...left.events, ...right.events].sort(
    ascend((e) => LamportTimestamp.toNumber(e.happenedAt)),
  )

  const distinctEvents = eventsNew.filter(
    (event, index, self) =>
      index === self.findIndex((e) => e.eventId === event.eventId),
  )

  const snapshots = { ...left.snapshots, ...right.snapshots }

  const clock = LamportClock.update(left.clock, right.clock)

  return {
    clock,
    events: distinctEvents,
    snapshots,
    eventIds: {
      ...left.eventIds,
      ...right.eventIds,
    },
  }
}
