import { AppRoute } from "gamezilla/@CHILD/app/@SHARED/client";
import { Profile, SpaceId, UserId } from "gamezilla/@CHILD/app/@SHARED/data";
import { CappedOrderedDict } from "gamezilla/@SHARED/data-structures/capped-ordered-dict";
import {
  EventStreamInMemory,
  EventStreamInferInstance,
} from "gamezilla/@SHARED/event-stream";
import {
  LamportClock,
  LamportTimestamp,
} from "gamezilla/@SHARED/lamport-clock";
import * as Game from "./@CHILD/game/game.core";
import {
  EventId,
  EventMeta,
  WithEventId,
  WithEventMeta,
} from "./@SHARED/event";
import { SpaceEvent, State, initState, reducer } from "./spaces-state";

//
//
//
// Model
//
//
//

export const SpaceEvents = EventStreamInMemory<
  EventId,
  SpaceEvent & EventMeta,
  Indexes
>();

export type SpaceEventsInstance = EventStreamInferInstance<typeof SpaceEvents>;

export type CoreModel = {
  clock: LamportClock;
  snapshots: CappedOrderedDict<EventId, State>;
  events: SpaceEventsInstance;
};

export type ServerModel = CoreModel & {
  games: {
    [spaceId: SpaceId]: Game.ServerModel;
  };
  profileCache: {
    [userId: UserId]: Profile;
  };
};

export type ClientModel = CoreModel & {
  games: {
    [spaceId: SpaceId]: Game.ClientModel;
  };
  previewUserId: UserId | null;
  modal: Modal;
  latestState: State;
  isSyncing: boolean;
};

type Modal = null | "user-preview" | "users";

//
//
//
// Msg
//
//
//

export type ToClient = ToClientExtra &
  (
    | {
        t: "event";
        c: WithEventMeta<SpaceEvent>;
        clock: LamportClock;
      }
    | {
        t: "sync";
        spaceId: SpaceId;
        events: CoreModel["events"];
        clock: CoreModel["clock"];
        snapshots: CoreModel["snapshots"];
      }
    | {
        t: "game";
        spaceId: SpaceId;
        c: Game.ToClient;
      }
  );

export type ToServer = ToServerExtra &
  (
    | {
        t: "event";
        c: WithEventMeta<SpaceEvent>;
        clock: LamportClock;
      }
    | {
        t: "sync";
        spaceId: SpaceId;
        events: CoreModel["events"];
        clock: CoreModel["clock"];
        snapshots: CoreModel["snapshots"];
      }
    | {
        t: "game";
        spaceId: SpaceId;
        c: Game.ToServer;
      }
  );

export type ToClientExtra = {
  profiles?: { [userId: UserId]: Profile };
  causedBy?: unknown;
  meta?: Record<string, unknown>;
};

export type ToServerExtra = {
  profiles?: { [userId: UserId]: Profile };
  meta?: Record<string, unknown>;
};

export type ServerMsg = { t: "game"; spaceId: SpaceId; c: Game.ServerMsg };

export type ClientMsg =
  | { t: "event"; c: WithEventId<SpaceEvent> }
  | { t: "game"; spaceId: SpaceId; c: Game.ClientMsg }
  | { t: "closed-modal" }
  | { t: "clicked-people-button" }
  | { t: "clicked-back-button"; from: "join-screen" }
  | { t: "clicked-space-card"; spaceId: SpaceId }
  | { t: "clicked-user"; userId: UserId }
  | { t: "clicked-link"; route: AppRoute };

//
//
//
//
//
//
//
//

export const initCore = async (): Promise<CoreModel> => {
  return {
    events: await SpaceEvents.init(config),
    clock: LamportClock.init(),
    snapshots: CappedOrderedDict.init({ maxSize: 5 }),
  };
};

export const appendEvent = async (
  model: CoreModel,
  event: WithEventId<SpaceEvent>
): Promise<CoreModel> => {
  const eventWithMeta: WithEventMeta<SpaceEvent> = {
    ...event,
    happenedAt: LamportClock.toCurrentTime(model.clock),
  };

  const appended: CoreModel = {
    snapshots: model.snapshots,
    clock: LamportClock.increment(model.clock),
    events: await SpaceEvents.append(config, model.events, eventWithMeta),
  };

  const stateNew = await deriveState(appended);

  const added: CoreModel = {
    clock: appended.clock,
    events: appended.events,
    snapshots: CappedOrderedDict.add(
      appended.snapshots,
      eventWithMeta.eventId,
      stateNew
    ),
  };

  return added;
};

export const mergeModels = async (
  model: CoreModel,
  otherModel: CoreModel
): Promise<CoreModel> => {
  const streamNew = await SpaceEvents.mergeLeft(
    config,
    model.events,
    otherModel.events
  );

  const modelNew: CoreModel = {
    events: streamNew,
    clock: LamportClock.update(model.clock, otherModel.clock),
    snapshots: CappedOrderedDict.mergeLeft(
      otherModel.snapshots,
      model.snapshots
    ),
  };

  return modelNew;
};

type Indexes = "indexSpaceId" | "indexSpaceIdAndGame";

export const config = SpaceEvents.config({
  indexes: {
    indexSpaceId: (event) => event.spaceId,
    indexSpaceIdAndGame: (event) =>
      `${event.spaceId},${event.t === "game" ? event.c.t : ""}`,
  },
  toId: (event) => event.eventId,
  toOrdering: (event) => LamportTimestamp.toNumber(event.happenedAt),
});

//
//
//
//
//
//
//

export const deriveState = async (model: CoreModel): Promise<State> => {
  let runningState: State = initState();

  const eventIds: EventId[] = [];

  //
  //
  // Starting at the latest snapshot, walk backwards through the events
  //
  //
  for (let i = model.events._ordering.length - 1; i >= 0; i--) {
    const eventId = model.events._ordering[i];

    if (!eventId) {
      continue;
    }

    const snapshot = CappedOrderedDict.get(model.snapshots, eventId);

    if (snapshot) {
      runningState = snapshot;
      break;
    }

    eventIds.push(eventId);
  }

  //
  //
  //
  // Derive the state from the events
  //
  //
  //
  for (let i = eventIds.length - 1; i >= 0; i--) {
    const eventId = eventIds[i];

    if (!eventId) {
      continue;
    }

    const event = await SpaceEvents.get(model.events, eventId);

    if (!event) {
      continue;
    }

    runningState = reducer({ state: runningState, event });
  }

  return runningState;
};
