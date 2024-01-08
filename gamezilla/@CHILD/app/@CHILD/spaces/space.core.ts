import { ascend } from "gamezilla/@SHARED/core";
import {
  LamportClock,
  LamportTimestamp,
} from "gamezilla/@SHARED/lamport-clock";
import { EventId, WithEventMeta } from "./@SHARED/event";
import {
  SpaceEvent,
  StateSpace,
  initStateSpace,
  reducerSpace,
} from "./spaces-state";

type SpaceModel = {
  events: WithEventMeta<SpaceEvent>[];
  clock: LamportClock;
  snapshots: {
    [eventId: EventId]: StateSpace;
  };
};

export const appendEvent = ({
  model,
  event,
}: {
  model: SpaceModel;
  event: WithEventMeta<SpaceEvent>;
}): SpaceModel => {
  //
  //
  //
  const newSnapshots = { ...model.snapshots };

  const newEvents = [...model.events, event].sort(
    ascend((e) => LamportTimestamp.toNumber(e.happenedAt))
  );

  //
  // Remove invalid snapshots
  //

  const newEventIndex = newEvents.findIndex((e) => e.eventId === event.eventId);
  for (let i = newEventIndex; i < newEvents.length; i++) {
    const eventId = newEvents[i]!.eventId;
    delete newSnapshots[eventId];
    continue;
  }

  //
  //
  //

  const modelNew: SpaceModel = {
    snapshots: model.snapshots,
    clock: LamportClock.increment(model.clock),
    events: newEvents,
  };

  //
  //
  //

  return modelNew;
};

export const deriveSpaceState = (model: SpaceModel): StateSpace => {
  //
  //
  //

  let running: StateSpace = initStateSpace();
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
    running = reducerSpace({ state: running, event });
  }

  return running;
};
