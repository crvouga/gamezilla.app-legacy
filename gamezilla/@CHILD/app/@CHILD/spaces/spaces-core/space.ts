import { SpaceId, UserId } from "gamezilla/@CHILD/app/@SHARED/data";
import { ascend } from "gamezilla/@SHARED/core";
import {
  LamportClock,
  LamportTimestamp,
} from "gamezilla/@SHARED/lamport-clock";
import { EventId, WithEventId, WithEventMeta } from "../@SHARED/event";
import { SpaceEvent } from "./space-event";
import * as SpaceState from "./space-state";

//
//
//
//
//
//

export type Model = {
  msgEvents: WithEventMeta<SpaceEvent>[];
  clock: LamportClock;
  snapshots: {
    [msgEventId: EventId]: SpaceState.State;
  };
};

export const init: Model = {
  clock: LamportClock.init,
  msgEvents: [],
  snapshots: {},
};

//
//
//
//
//
//

export const startFromLatestSnapshot = (model: Model): Model => {
  const msgEvents: WithEventMeta<SpaceEvent>[] = [];

  for (let i = model.msgEvents.length - 1; i >= 0; i--) {
    const msgEvent = model.msgEvents[i]!;

    const snapshot = model.snapshots[msgEvent.msgEventId];

    msgEvents.unshift(msgEvent);

    if (snapshot) {
      return {
        clock: model.clock,
        msgEvents: msgEvents,
        snapshots: {
          [msgEvent.msgEventId]: snapshot,
        },
      };
    }
  }

  return {
    clock: model.clock,
    msgEvents: msgEvents,
    snapshots: {},
  };
};

//
//
//
//
//

export const appendEvent = ({
  model,
  msgEvent,
}: {
  model: Model;
  msgEvent: WithEventId<SpaceEvent>;
}): Model => {
  //
  //
  //

  const newEvent: WithEventMeta<SpaceEvent> = {
    ...msgEvent,
    happenedAt: LamportClock.toCurrentTime(model.clock),
  };

  const newSnapshots = { ...model.snapshots };

  const newEvents = [...model.msgEvents, newEvent].sort(
    ascend((e) => LamportTimestamp.toNumber(e.happenedAt))
  );

  //
  // Remove invalid snapshots
  //

  const newEventIndex = newEvents.findIndex(
    (e) => e.msgEventId === msgEvent.msgEventId
  );

  if (newEventIndex === -1) {
    return model;
  }

  if (newEvents.length - newEventIndex > 50) {
    return model;
  }

  for (let i = newEventIndex; i < newEvents.length; i++) {
    const msgEventId = newEvents[i]!.msgEventId;
    delete newSnapshots[msgEventId];
    continue;
  }

  //
  // Add new snapshot
  //

  const snapshot = deriveState({
    clock: model.clock,
    msgEvents: newEvents,
    snapshots: newSnapshots,
  });

  newSnapshots[msgEvent.msgEventId] = snapshot;

  //
  //
  //

  const newClock = LamportClock.increment(model.clock);

  //
  //

  const modelNew: Model = {
    snapshots: newSnapshots,
    clock: newClock,
    msgEvents: newEvents,
  };

  //
  //
  //

  return modelNew;
};

export const toEventWithMeta = (model: Model, msgEventId: EventId) => {
  const msgEvent = model.msgEvents.find((e) => e.msgEventId === msgEventId);

  if (!msgEvent) {
    return null;
  }

  return msgEvent;
};

export const hasEvent = (model: Model, msgEventId: EventId) => {
  return model.msgEvents.some((e) => e.msgEventId === msgEventId);
};

export const toSpaceId = (model: Model): SpaceId | null => {
  const state = deriveState(model);

  switch (state.type) {
    case "ended":
    case "started": {
      return state.spaceId;
    }
    case "initial": {
      return null;
    }
  }
};

export const deriveState = (model: Model): SpaceState.State => {
  //
  //
  //

  let running = SpaceState.initState;

  const msgEvents: WithEventMeta<SpaceEvent>[] = [];

  for (let i = model.msgEvents.length - 1; i >= 0; i--) {
    const msgEvent = model.msgEvents[i]!;

    const snapshot = model.snapshots[msgEvent.msgEventId];

    if (snapshot) {
      running = snapshot;
      break;
    }

    msgEvents.push(msgEvent);
  }

  //
  //
  //

  for (const msgEvent of msgEvents) {
    running = SpaceState.reducer({ state: running, msgEvent });
  }

  return running;
};

export const toSpaceStarted = (model: Model): SpaceState.Started | null => {
  const state = deriveState(model);

  switch (state.type) {
    case "started": {
      return state;
    }
    default: {
      return null;
    }
  }
};

export const toUserIds = (model: Model): UserId[] => {
  return SpaceState.toUserIds(deriveState(model));
};

export const merge = (left: Model, right: Model): Model => {
  const msgEvents = [...left.msgEvents, ...right.msgEvents].sort(
    ascend((e) => LamportTimestamp.toNumber(e.happenedAt))
  );

  const snapshots = { ...left.snapshots, ...right.snapshots };

  const clock = LamportClock.update(left.clock, right.clock);

  return {
    clock,
    msgEvents,
    snapshots,
  };
};
