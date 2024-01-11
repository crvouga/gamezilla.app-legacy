import { UserId } from "gamezilla/@CHILD/app/@SHARED/data";
import { ascend } from "gamezilla/@SHARED/core";
import {
  LamportClock,
  LamportTimestamp,
} from "gamezilla/@SHARED/lamport-clock";
import { EventId, WithEventId, WithEventMeta } from "../@SHARED/event";
import { SpaceEvent } from "./space-event";
import {
  StateSpace,
  StateSpaceStarted,
  initState,
  reducer,
} from "./space-state";

//
//
//
//
//
//

export type Model = {
  events: WithEventMeta<SpaceEvent>[];
  clock: LamportClock;
  snapshots: {
    [eventId: EventId]: StateSpace;
  };
};

export const init: Model = {
  clock: LamportClock.init,
  events: [],
  snapshots: {},
};

//
//
//
//
//
//

export const startFromLatestSnapshot = (model: Model): Model => {
  const events: WithEventMeta<SpaceEvent>[] = [];

  for (let i = model.events.length - 1; i >= 0; i--) {
    const event = model.events[i]!;

    const snapshot = model.snapshots[event.eventId];

    events.push(event);

    if (snapshot) {
      return {
        clock: model.clock,
        events: events.reverse(),
        snapshots: {
          [event.eventId]: snapshot,
        },
      };
    }
  }

  return {
    clock: model.clock,
    events: events.reverse(),
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
  event,
}: {
  model: Model;
  event: WithEventId<SpaceEvent>;
}): Model => {
  //
  //
  //

  const newEvent: WithEventMeta<SpaceEvent> = {
    ...event,
    happenedAt: LamportClock.toCurrentTime(model.clock),
  };

  const newSnapshots = { ...model.snapshots };

  const newEvents = [...model.events, newEvent].sort(
    ascend((e) => LamportTimestamp.toNumber(e.happenedAt))
  );

  //
  // Remove invalid snapshots
  //

  const newEventIndex = newEvents.findIndex((e) => e.eventId === event.eventId);

  if (newEventIndex === -1) {
    return model;
  }

  if (newEvents.length - newEventIndex > 50) {
    return model;
  }

  for (let i = newEventIndex; i < newEvents.length; i++) {
    const eventId = newEvents[i]!.eventId;
    delete newSnapshots[eventId];
    continue;
  }

  //
  // Add new snapshot
  //

  const snapshot = deriveState({
    clock: model.clock,
    events: newEvents,
    snapshots: newSnapshots,
  });

  newSnapshots[event.eventId] = snapshot;

  //
  //
  //

  const newClock = LamportClock.increment(model.clock);

  //
  //

  const modelNew: Model = {
    snapshots: newSnapshots,
    clock: newClock,
    events: newEvents,
  };

  //
  //
  //

  return modelNew;
};

export const deriveState = (model: Model): StateSpace => {
  //
  //
  //

  let running = initState;

  const events: WithEventMeta<SpaceEvent>[] = [];

  for (let i = model.events.length - 1; i >= 0; i--) {
    const event = model.events[i]!;

    const snapshot = model.snapshots[event.eventId];

    if (snapshot) {
      running = snapshot;
      break;
    }

    events.push(event);
  }

  //
  //
  //

  for (const event of events) {
    running = reducer({ state: running, event });
  }

  return running;
};

export const toSpaceStarted = (model: Model): StateSpaceStarted | null => {
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
  const state = deriveState(model);

  if (state.type === "started") {
    return Object.values(state.users);
  }

  return [];
};

export const merge = (left: Model, right: Model): Model => {
  const events = [...left.events, ...right.events].sort(
    ascend((e) => LamportTimestamp.toNumber(e.happenedAt))
  );

  const snapshots = { ...left.snapshots, ...right.snapshots };

  const clock = LamportClock.update(left.clock, right.clock);

  return {
    clock,
    events,
    snapshots,
  };
};
