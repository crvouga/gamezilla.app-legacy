import { Space } from "gamezilla/@CHILD/app/@CHILD/space/@SHARED/space";
import { Profile, SpaceId, UserId } from "gamezilla/@CHILD/app/@SHARED/data";
import { memoize } from "gamezilla/@SHARED/core";
import {
  EventStream,
} from "gamezilla/@SHARED/event-stream";
import { LamportClock } from "gamezilla/@SHARED/lamport-clock";
import * as Game from "./@CHILD/game/game.core";
import {
  EventId,
  EventMeta,
  WithEventId,
  WithEventMeta,
} from "./@SHARED/event";
import { LamportTimestamp } from "gamezilla/@SHARED/lamport-clock/lamport-timestamp";

//
//
//
// Model
//
//
//

export type CoreModel = {
  clock: LamportClock;
  events: EventStream<Event & EventMeta, Indexes, EventId>;
  initialState: State;
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
  modal: ModalModel;
};

type ModalModel = null | "user-preview" | "users";

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
        c: WithEventMeta<Event>;
        clock: LamportClock;
      }
    | {
        t: "sync";
        events: CoreModel["events"];
        clock: LamportClock;
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
        c: WithEventMeta<Event>;
        clock: LamportClock;
      }
    | {
        t: "sync";
        events: CoreModel["events"];
        clock: LamportClock;
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
  | { t: "event"; c: WithEventId<Event> }
  | { t: "game"; spaceId: SpaceId; c: Game.ClientMsg }
  | { t: "closed-modal" }
  | { t: "clicked-people-button" }
  | { t: "clicked-user"; userId: UserId };

//
//
//
//
//
//
//
//

export const initCore = (): CoreModel => {
  return {
    events: EventStream.empty(config),
    initialState: initState(),
    clock: LamportClock.init(),
  };
};

export const appendEvent = (
  model: CoreModel,
  event: WithEventId<Event>
): CoreModel => {
  const eventWithMeta: WithEventMeta<Event> = {
    ...event,
    happenedAt: LamportClock.toTimestamp(model.clock),
  }
  return {
    ...model,
    clock: LamportClock.increment(model.clock),
    events: EventStream.append(config, model.events, eventWithMeta),
  };
};

export const mergeModels = (model: CoreModel, otherModel: CoreModel): CoreModel => {
  const streamNew = EventStream.mergeLeft(config, model.events, otherModel.events);

  const modelNew: CoreModel = {
    initialState: model.initialState,
    events: streamNew,
    clock: LamportClock.update(model.clock, otherModel.clock),
  };

  return modelNew;
};

type Indexes = "indexSpaceId";

const config = EventStream.initConfig<Event & EventMeta, Indexes, EventId>({
  indexes: {
    indexSpaceId: (event) => event.spaceId,
  },
  toId: (event) => event.eventId,
  toOrdering: (event) => LamportTimestamp.toNumber(event.happenedAt),
});

type UserState = {
  userId: UserId;
  spaceId: SpaceId | null;
};

export const toUserState = (model: CoreModel, userId: UserId): UserState => {
  const state = toState(model);

  const userSpaceId = state.spaceIdByUserId[userId];

  const stateUser: UserState = {
    userId,
    spaceId: userSpaceId ?? null,
  };

  return stateUser;
};

//
//
//
// Msg
//
//
//

export type Event =
  | {
      t: "user-started-space";
      userId: UserId;
      spaceId: SpaceId;
    }
  | {
      t: "user-ended-space";
      userId: UserId;
      spaceId: SpaceId;
    }
  | {
      t: "user-joined-space";
      userId: UserId;
      spaceId: SpaceId;
    }
  | {
      t: "user-left-space";
      userId: UserId;
      spaceId: SpaceId;
    }
  | {
      t: "user-inputted-game";
      userId: UserId;
      spaceId: SpaceId;
      game: Game.GameName | null;
    }
  | {
      t: "game";
      spaceId: SpaceId;
      c: Game.GameEvent;
    };


export type SpaceStateInitial = {
  type: "initial";
};

export type SpaceStateStarted = Space & {
  type: "started";
  game: Game.GameState | null;
  latestEvent: EventId;
};

export type SpaceStateEnded = Space & {
  type: "ended";
  latestEvent: EventId;
};

export type StateSpace =
  | SpaceStateInitial
  | SpaceStateStarted
  | SpaceStateEnded;

export const toSpaceState = (
  model: CoreModel,
  spaceId: SpaceId
): StateSpace => {
  const state = toState(model);

  const spaceState: StateSpace = state.spaces[spaceId] ?? {
    type: "initial",
  };

  return spaceState;
};

export const toStartedSpace = (
  model: CoreModel,
  spaceId: SpaceId
): SpaceStateStarted | null => {
  const state = toState(model);

  const spaceState: StateSpace = state.spaces[spaceId] ?? {
    type: "initial",
  };

  if (spaceState.type === "initial") {
    return null;
  }

  if (spaceState.type === "ended") {
    return null;
  }

  return spaceState;
};

type State = {
  spaces: {
    [spaceId: SpaceId]: StateSpace;
  };
  spaceIdByUserId: {
    [userId: UserId]: SpaceId;
  };
  active: {
    [spaceId: SpaceId]: SpaceId;
  };
  errorsByUserId: {
    [userId: UserId]: WithEventId<Event> & { error: string };
  };
};

const initState = (): State => {
  return {
    spaces: {},
    spaceIdByUserId: {},
    active: {},
    errorsByUserId: {},
  };
};

const reducer = ({
  state,
  event,
}: {
  state: State;
  event: WithEventMeta<Event>;
}): State => {
  switch (event.t) {
    case "game": {
      const space = state.spaces[event.spaceId];
      if (!space) {
        return state;
      }

      if (space.type === "initial") {
        return state;
      }
      if (space.type === "ended") {
        return state;
      }
      const gameState = space.game ?? Game.initState(event.c.t);
      const gameNew = Game.reducer({
        ctx: { space },
        state: gameState,
        event: { ...event, ...event.c },
      });
      return {
        ...state,
        spaces: {
          ...state.spaces,
          [event.spaceId]: {
            ...space,
            latestEvent: event.eventId,
            game: gameNew,
          },
        },
      };
    }
    case "user-ended-space": {
      const space = state.spaces[event.spaceId];

      if (!space) {
        return state;
      }

      if (space.type === "initial") {
        return state;
      }

      if (space.type === "ended") {
        return state;
      }

      if (event.userId !== space.hostId) {
        return state;
      }

      const spaceIdByUserIdNew = { ...state.spaceIdByUserId };
      for (const userId in space.users) {
        if (UserId.is(userId)) {
          delete spaceIdByUserIdNew[userId];
        }
      }

      const activeNew = { ...state.active };
      delete activeNew[event.spaceId];

      return {
        ...state,
        spaces: {
          ...state.spaces,
          [event.spaceId]: {
            ...space,
            latestEvent: event.eventId,
            type: "ended",
          },
        },
        active: activeNew,
        spaceIdByUserId: spaceIdByUserIdNew,
      };
    }

    case "user-inputted-game": {
      const space = state.spaces[event.spaceId];

      if (!space) {
        return state;
      }

      if (space.type === "initial") {
        return state;
      }

      if (space.type === "ended") {
        return state;
      }

      if (event.userId !== space.hostId) {
        return state;
      }

      return {
        ...state,
        spaces: {
          ...state.spaces,
          [event.spaceId]: {
            ...space,
            latestEvent: event.eventId,
            game: event.game ? Game.initState(event.game) : null,
          },
        },
      };
    }

    case "user-joined-space": {
      const userSpaceId = state.spaceIdByUserId[event.userId];
      if (userSpaceId) {
        return state;
      }
      const space = state.spaces[event.spaceId];
      if (!space) {
        return state;
      }
      if (space.type === "ended") {
        return state;
      }
      if (space.type === "initial") {
        return state;
      }

      return {
        ...state,
        spaces: {
          ...state.spaces,
          [event.spaceId]: {
            ...space,
            latestEvent: event.eventId,
            users: {
              ...space.users,
              [event.userId]: event.userId,
            },
          },
        },
        spaceIdByUserId: {
          ...state.spaceIdByUserId,
          [event.userId]: event.spaceId,
        },
      };
    }

    case "user-left-space": {
      const userSpaceId = state.spaceIdByUserId[event.userId];
      if (userSpaceId !== event.spaceId) {
        return state;
      }
      const space = state.spaces[userSpaceId];
      if (!space) {
        return state;
      }
      if (space.type === "ended") {
        return state;
      }
      if (space.type === "initial") {
        return state;
      }
      if (space.hostId === event.userId) {
        return state;
      }
      const usersNew = { ...space.users };
      delete usersNew[event.userId];
      const spaceIdByUserIdNew = { ...state.spaceIdByUserId };
      delete spaceIdByUserIdNew[event.userId];
      return {
        ...state,
        spaces: {
          ...state.spaces,
          [userSpaceId]: {
            ...space,
            latestEvent: event.eventId,
            users: usersNew,
          },
        },
        spaceIdByUserId: spaceIdByUserIdNew,
      };
    }

    case "user-started-space": {
      const space = state.spaces[event.spaceId];

      if (space) {
        return state;
      }

      const userSpaceId = state.spaceIdByUserId[event.userId];

      if (userSpaceId) {
        return state;
      }

      const spaceIdByUserIdNew: State["spaceIdByUserId"] = {
        ...state.spaceIdByUserId,
      };
      spaceIdByUserIdNew[event.userId] = event.spaceId;

      const activeNew: State["active"] = { ...state.active };
      activeNew[event.spaceId] = event.spaceId;

      const spaceNew: State["spaces"][SpaceId] = {
        type: "started",
        spaceId: event.spaceId,
        hostId: event.userId,
        visibility: "public",
        users: {
          [event.userId]: event.userId,
        },
        game: null,
        latestEvent: event.eventId,
      };

      const spacesNew: State["spaces"] = {
        ...state.spaces,
        [event.spaceId]: spaceNew,
      };

      return {
        ...state,
        active: activeNew,
        spaces: spacesNew,
        spaceIdByUserId: spaceIdByUserIdNew,
      };
    }
  }
};

function toState_(model: CoreModel): State {
  let state: State = model.initialState;

  for (const event of EventStream.toIterable(model.events)) {
    state = reducer({ state, event });
  }

  return state;
}

export const toState = memoize((model) => model.events.hash, toState_);
// const toState = toState_;

const exposed = {
  toState_,
  toState,
  toSpaceState,
  EventStream,
  config,
};

declare global {
  interface Window {
    space: typeof exposed;
  }
}

if (typeof window !== "undefined") {
  window.space = exposed;
}
