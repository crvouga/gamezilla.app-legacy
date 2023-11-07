import { EventMeta, EventStream } from "gamezilla/@SHARED/event-stream";
import { Profile, SpaceId, UserId } from "gamezilla/@CHILD/app/@SHARED/data";
import { Space } from "gamezilla/@CHILD/app/@CHILD/space/@SHARED";
import * as Game from "./@CHILD/game/game.core";
import { memoize } from "gamezilla/@SHARED/core";

//
//
//
// Model
//
//
//

export type CoreModel = {
  events: EventStream<Event, Indexes>;
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
    | EventWithMeta
    | { t: "game-msg"; spaceId: SpaceId; c: Game.ToClient }
    | { t: "sync"; events: CoreModel["events"] }
  );

export type ToServer = ToServerExtra &
  (EventWithMeta | { t: "game-msg"; spaceId: SpaceId; c: Game.ToServer });

export type ToClientExtra = {
  profiles?: { [userId: UserId]: Profile };
};

export type ToServerExtra = {
  profile?: Profile | null;
};

export type ServerMsg = { t: "game-msg"; spaceId: SpaceId; c: Game.ServerMsg };

export type ClientMsg =
  | EventWithMeta
  | { t: "game-msg"; spaceId: SpaceId; c: Game.ClientMsg }
  | { t: "modal-closed" }
  | { t: "modal-open"; c: ModalModel }
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
  };
};

export const appendEvent = (
  model: CoreModel,
  event: EventWithMeta
): CoreModel => {
  return {
    ...model,
    events: EventStream.append(config, model.events, event),
  };
};

export const mergeModels = (left: CoreModel, right: CoreModel): CoreModel => {
  const streamNew = EventStream.merge(config, left.events, right.events);

  const modelNew = {
    initialState: left.initialState,
    events: streamNew,
  };

  return modelNew;
};

type Indexes = "indexSpaceId";

const config = EventStream.init<Event, Indexes>({
  indexSpaceId: (event) => event.spaceId,
});

export const toSpaceEvents = (
  model: CoreModel,
  spaceId: SpaceId
): EventStream<Event, Indexes> => {
  return EventStream.subset(config, model.events, "indexSpaceId", spaceId);
};

type StateUser = {
  userId: UserId;
  spaceId: SpaceId | null;
};

export const toStateUser = (model: CoreModel, userId: UserId): StateUser => {
  const state = toState(model);

  const userSpaceId = state.spaceIdByUserId[userId];

  const stateUser: StateUser = {
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
      profile?: Profile;
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

export type EventWithMeta = Event & EventMeta;

export type StateInitial = {
  type: "initial";
};

export type StateStarted = Space & {
  type: "started";
  game: Game.GameState | null;
};

export type StateEnded = Space & {
  type: "ended";
};

export type StateSpace = StateInitial | StateStarted | StateEnded;

export const toStateSpace = (
  model: CoreModel,
  spaceId: SpaceId
): StateSpace => {
  const state = toState(model);

  const spaceState: StateSpace = state.spaces[spaceId] ?? {
    type: "initial",
  };

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
    [spaceId: SpaceId]: true;
  };
  errorsByUserId: {
    [userId: UserId]: EventWithMeta & { error: string };
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
  event: EventWithMeta;
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
      const spaceIdByUserIdNew = { ...state.spaceIdByUserId };
      spaceIdByUserIdNew[event.userId] = event.spaceId;

      const activeNew = { ...state.active };
      activeNew[event.spaceId] = true;
      return {
        ...state,
        active: activeNew,
        spaces: {
          ...state.spaces,
          [event.spaceId]: {
            type: "started",
            spaceId: event.spaceId,
            hostId: event.userId,
            visibility: "public",
            users: {
              [event.userId]: event.userId,
            },
            game: null,
          },
        },
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

const toState = memoize((model) => model.events.hash, toState_);
// const toState = toState_;

if (typeof window !== "undefined") {
  //@ts-ignore
  window.toState_ = toState_;
  //@ts-ignore
  window.toState = toState;
  // @ts-ignore
  window.toStateSpace = toStateSpace;
}
