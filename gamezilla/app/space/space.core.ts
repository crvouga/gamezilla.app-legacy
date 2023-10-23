import { Profile, UserId } from "gamezilla/app/@SHARED/data";
import { SpaceId } from "../@SHARED/data/space-id";
import { Space } from "./@SHARED";
import { EventMeta, appendEvt, withMeta } from "./@SHARED/evt";
import * as Game from "./game/game.core";

//
//
//
// Model
//
//
//

export type CoreModel = {
  spaceEvents: {
    [spaceId: SpaceId]: SpaceModel;
  };
  spaceByUserId: {
    [userId: UserId]: SpaceId;
  };
};

export type SpaceModel = {
  events: (Evt & EventMeta)[];
  initialState: State;
};

export const appendEvent = (
  model: CoreModel,
  evt: Evt & EventMeta
): CoreModel => {
  const space = model.spaceEvents[evt.spaceId] ?? {
    events: [],
    initialState: {
      type: "initial",
    },
  };

  const { spaceByUserId } = reducerSpaceByUserId(model.spaceByUserId, evt);

  const eventsNew = appendEvt(space.events, evt);

  return {
    spaceByUserId,
    spaceEvents: {
      ...model.spaceEvents,
      [evt.spaceId]: {
        ...space,
        events: eventsNew,
      },
    },
  };
};

const reducerSpaceByUserId = (
  spaceByUserId: CoreModel["spaceByUserId"],
  event: Evt & EventMeta
): {
  spaceByUserId: CoreModel["spaceByUserId"];
} => {
  switch (event.t) {
    case "user-left-space":
    case "user-ended-space": {
      delete spaceByUserId[event.userId];
      return { spaceByUserId };
    }
    case "user-started-space":
    case "user-joined-space": {
      spaceByUserId[event.userId] = event.spaceId;
      return {
        spaceByUserId,
      };
    }
    default: {
      return { spaceByUserId };
    }
  }
};

const mergeEvents = (
  events: (Evt & EventMeta)[],
  eventsNew: (Evt & EventMeta)[]
): (Evt & EventMeta)[] => {
  const eventsNewMap = new Map<string, Evt & EventMeta>();

  for (const evt of events) {
    eventsNewMap.set(evt.eventId, evt);
  }
  for (const evt of eventsNew) {
    eventsNewMap.set(evt.eventId, evt);
  }
  const sorted = Array.from(eventsNewMap.values()).sort(
    (a, b) => a.happenedAt - b.happenedAt
  );
  return sorted;
};

export const mergeModels = (
  model: CoreModel,
  modelNew: CoreModel
): CoreModel => {
  const spacesNew: CoreModel["spaceEvents"] = {};

  for (const spaceId in modelNew.spaceEvents) {
    if (!SpaceId.is(spaceId)) {
      continue;
    }
    const space = model.spaceEvents[spaceId];
    const spaceNew = modelNew.spaceEvents[spaceId];
    if (!space && !spaceNew) {
      continue;
    }
    if (!space && spaceNew) {
      spacesNew[spaceId] = spaceNew;
      continue;
    }
    if (!spaceNew && space) {
      spacesNew[spaceId] = space;
      continue;
    }

    if (space && spaceNew) {
      spacesNew[spaceId] = {
        ...space,
        events: mergeEvents(space.events, spaceNew.events),
      };
      continue;
    }
  }

  return {
    spaceEvents: spacesNew,
    spaceByUserId: {
      ...model.spaceByUserId,
      ...modelNew.spaceByUserId,
    },
  };
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
    | (Evt & EventMeta)
    | { t: "game-msg"; spaceId: SpaceId; c: Game.ToClient }
    | { t: "sync"; model: CoreModel }
  );

export type ToServer = ToServerExtra &
  ((Evt & EventMeta) | { t: "game-msg"; spaceId: SpaceId; c: Game.ToServer });

export type ToClientExtra = {
  profiles?: { [userId: UserId]: Profile };
};

export type ToServerExtra = {
  profile?: Profile | null;
};

export type ServerMsg = { t: "game-msg"; spaceId: SpaceId; c: Game.ServerMsg };

export type ClientMsg =
  | (Evt & EventMeta)
  | { t: "game-msg"; c: Game.ClientMsg }
  | { t: "modal-closed" }
  | { t: "modal-open"; c: ModalModel }
  | { t: "clicked-user"; userId: UserId };

//
//
//
// Msg
//
//
//

export type Evt =
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
      c: Game.Evt;
    };

export type StateInitial = {
  type: "initial";
};

export type StateStarted = {
  type: "started";
  space: Space;
  game: Game.State | null;
};

export type StateEnded = {
  type: "ended";
  space: Space;
};

export type State = StateInitial | StateStarted | StateEnded;

export const reducer = (
  spacesByUserId: CoreModel["spaceByUserId"],
  state: State,
  evt: Evt & EventMeta
): State => {
  switch (state.type) {
    case "ended": {
      return state;
    }
    case "initial": {
      switch (evt.t) {
        case "user-started-space": {
          return {
            type: "started",
            space: {
              spaceId: evt.spaceId,
              hostId: evt.userId,
              visibility: "public",
              users: {
                [evt.userId]: evt.userId,
              },
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
      switch (evt.t) {
        case "user-started-space": {
          return {
            type: "started",
            space: {
              spaceId: evt.spaceId,
              hostId: evt.userId,
              visibility: "public",
              users: {
                [evt.userId]: evt.userId,
              },
            },
            game: null,
          };
        }

        case "user-ended-space": {
          return {
            type: "ended",
            space: state.space,
          };
        }

        case "user-inputted-game": {
          if (!evt.game) {
            return {
              ...state,
              game: null,
            };
          }
          return {
            ...state,
            game: Game.initState(evt.game),
          };
        }

        case "user-joined-space": {
          return {
            ...state,
          };
        }

        case "user-left-space": {
          return {
            ...state,
            space: {
              ...state.space,
              users: {
                ...state.space.users,
                [evt.userId]: undefined,
              },
            },
          };
        }

        case "game": {
          if (!state.game) {
            return state;
          }

          const gameNew = Game.reducer({
            ctx: state,
            state: state.game,
            evt: { ...evt, ...evt.c },
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

export const toState = (
  spaceByUserId: CoreModel["spaceByUserId"],
  model: SpaceModel
): State => {
  return model.events.reduce(
    (acc, event) => reducer(spaceByUserId, acc, event),
    model.initialState
  );
};
