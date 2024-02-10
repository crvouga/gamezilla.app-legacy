import { SpaceId, UserId } from "gamezilla/@CHILD/app/@SHARED/data"
import { ascend } from "gamezilla/@SHARED/core"
import { LamportClock, LamportTimestamp } from "gamezilla/@SHARED/lamport-clock"
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
  msgEvts: WithEventMeta<SpaceEvent>[]
  clock: LamportClock
  snapshots: {
    [msgEvtId: EventId]: SpaceState.State
  }
}

export const init: Model = {
  clock: LamportClock.init,
  msgEvts: [],
  snapshots: {},
}

//
//
//
//
//
//

export const startFromLatestSnapshot = (model: Model): Model => {
  const msgEvts: WithEventMeta<SpaceEvent>[] = []

  for (let i = model.msgEvts.length - 1; i >= 0; i--) {
    const msgEvt = model.msgEvts[i]!

    const snapshot = model.snapshots[msgEvt.eventId]

    msgEvts.unshift(msgEvt)

    if (snapshot) {
      return {
        clock: model.clock,
        msgEvts: msgEvts,
        snapshots: {
          [msgEvt.eventId]: snapshot,
        },
      }
    }
  }

  return {
    clock: model.clock,
    msgEvts: msgEvts,
    snapshots: {},
  }
}

//
//
//
//
//

export const appendEvent = ({
  model,
  msgEvt,
}: {
  model: Model
  msgEvt: WithEventId<SpaceEvent>
}): Model => {
  //
  //
  //

  const newEvent: WithEventMeta<SpaceEvent> = {
    ...msgEvt,
    happenedAt: LamportClock.toCurrentTime(model.clock),
  }

  const newSnapshots = { ...model.snapshots }

  const newEvents = [...model.msgEvts, newEvent].sort(
    ascend((e) => LamportTimestamp.toNumber(e.happenedAt)),
  )

  //
  // Remove invalid snapshots
  //

  const newEventIndex = newEvents.findIndex((e) => e.eventId === msgEvt.eventId)

  if (newEventIndex === -1) {
    return model
  }

  if (newEvents.length - newEventIndex > 50) {
    return model
  }

  for (let i = newEventIndex; i < newEvents.length; i++) {
    const msgEvtId = newEvents[i]!.eventId
    delete newSnapshots[msgEvtId]
    continue
  }

  //
  // Add new snapshot
  //

  const snapshot = deriveState({
    clock: model.clock,
    msgEvts: newEvents,
    snapshots: newSnapshots,
  })

  newSnapshots[msgEvt.eventId] = snapshot

  //
  //
  //

  const newClock = LamportClock.increment(model.clock)

  //
  //

  const modelNew: Model = {
    snapshots: newSnapshots,
    clock: newClock,
    msgEvts: newEvents,
  }

  //
  //
  //

  return modelNew
}

export const toEventWithMeta = (model: Model, msgEvtId: EventId) => {
  const msgEvt = model.msgEvts.find((e) => e.eventId === msgEvtId)

  if (!msgEvt) {
    return null
  }

  return msgEvt
}

export const hasEvent = (model: Model, msgEvtId: EventId) => {
  return model.msgEvts.some((e) => e.eventId === msgEvtId)
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

export const deriveState = (model: Model): SpaceState.State => {
  //
  //
  //

  let running = SpaceState.init

  const msgEvts: WithEventMeta<SpaceEvent>[] = []

  for (let i = model.msgEvts.length - 1; i >= 0; i--) {
    const msgEvt = model.msgEvts[i]!

    const snapshot = model.snapshots[msgEvt.eventId]

    if (snapshot) {
      running = snapshot
      break
    }

    msgEvts.push(msgEvt)
  }

  //
  //
  //

  for (const msgEvt of msgEvts) {
    running = SpaceState.reducer({ state: running, msgSpace: msgEvt })
  }

  return running
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
  const msgEvts = [...left.msgEvts, ...right.msgEvts].sort(
    ascend((e) => LamportTimestamp.toNumber(e.happenedAt)),
  )

  const snapshots = { ...left.snapshots, ...right.snapshots }

  const clock = LamportClock.update(left.clock, right.clock)

  return {
    clock,
    msgEvts,
    snapshots,
  }
}
