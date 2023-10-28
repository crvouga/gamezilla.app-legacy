import { EventMeta, EventStream } from "gamezilla/@SHARED/event-stream";
import { Profile, SpaceId, UserId } from "gamezilla/app/@SHARED/data";
import { Space } from "gamezilla/app/space/@SHARED";
import * as Game from "./game/game.core";

//
//
//
// Model
//
//
//

export type CoreModel = {
  events: EventStream<Event, Indexes>;
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
    | { t: "sync"; model: CoreModel }
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
  return {
    events: streamNew,
  };
};

type Indexes = "bySpaceId" | "byUserId";

const config = EventStream.init<Event, Indexes>({
  bySpaceId: (event) => [event.spaceId],
  byUserId: (event) => ("userId" in event ? [event.userId] : []),
});

type StateUser = {
  userId: UserId;
  spaceId: SpaceId | null;
};

const reducerUser = (state: StateUser, event: EventWithMeta): StateUser => {
  switch (event.t) {
    case "user-started-space": {
      if (state.spaceId) {
        return state;
      }
      return { ...state, spaceId: event.spaceId };
    }
    case "user-joined-space": {
      if (state.spaceId) {
        return state;
      }
      return { ...state, spaceId: event.spaceId };
    }
    case "user-left-space": {
      if (state.spaceId !== event.spaceId) {
        return state;
      }
      return { ...state, spaceId: null };
    }
    case "user-ended-space": {
      if (state.spaceId !== event.spaceId) {
        return state;
      }
      return { ...state, spaceId: null };
    }
    default: {
      return state;
    }
  }
};

export const toStateUser = (model: CoreModel, userId: UserId): StateUser => {
  const events = EventStream.subset(config, model.events, "byUserId", [userId]);

  let state: StateUser = { userId, spaceId: null };

  for (const event of EventStream.iter(config, events)) {
    state = reducerUser(state, event);
  }

  return state;
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
      c: Game.Event;
    };

export type EventWithMeta = Event & EventMeta;

export type StateInitial = {
  type: "initial";
};

export type StateStarted = Space & {
  type: "started";
  game: Game.State | null;
};

export type StateEnded = Space & {
  type: "ended";
};

export type StateSpace = StateInitial | StateStarted | StateEnded;

export const reducer = ({
  state,
  event,
  model,
}: {
  model: CoreModel;
  state: StateSpace;
  event: EventWithMeta;
}): StateSpace => {
  switch (state.type) {
    case "ended": {
      return state;
    }
    case "initial": {
      switch (event.t) {
        case "user-started-space": {
          return {
            type: "started",
            spaceId: event.spaceId,
            hostId: event.userId,
            visibility: "public",
            users: {
              [event.userId]: event.userId,
            },
            game: null,
          };
        }
        default: {
          return state;
        }
      }
    }
    case "started": {
      switch (event.t) {
        case "user-started-space": {
          return {
            type: "started",
            spaceId: event.spaceId,
            hostId: event.userId,
            visibility: "public",
            users: {
              [event.userId]: event.userId,
            },
            game: null,
          };
        }

        case "user-ended-space": {
          return {
            ...state,
            type: "ended",
          };
        }

        case "user-inputted-game": {
          if (!event.game) {
            return {
              ...state,
              game: null,
            };
          }
          return {
            ...state,
            game: Game.initState(event.game),
          };
        }

        case "user-joined-space": {
          const user = toStateUser(model, event.userId);
          if (user.spaceId) {
            return state;
          }
          return {
            ...state,
            users: {
              ...state.users,
              [event.userId]: event.userId,
            },
          };
        }

        case "user-left-space": {
          const usersNew = { ...state.users };
          delete usersNew[event.userId];
          return {
            ...state,
            users: usersNew,
          };
        }

        case "game": {
          if (!state.game) {
            return state;
          }

          const gameNew = Game.reducer({
            ctx: { space: state },
            state: state.game,
            event: { ...event, ...event.c },
          });

          return {
            ...state,
            game: gameNew,
          };
        }
      }
    }
  }
};

export const toState = (model: CoreModel, spaceId: SpaceId): StateSpace => {
  const bySpaceId = EventStream.subset(config, model.events, "bySpaceId", [
    spaceId,
  ]);

  let state: StateSpace = { type: "initial" };

  for (const event of EventStream.iter(config, bySpaceId)) {
    state = reducer({ state, event, model });
  }

  return state;
};

//@ts-ignore
window.config = config;
//@ts-ignore
window.EventStream = EventStream;
// @ts-ignore
window.toStateUser = toStateUser;
// @ts-ignore
window.toState = toState;
