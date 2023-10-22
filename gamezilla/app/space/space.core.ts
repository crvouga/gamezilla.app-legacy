import { Profile, UserId } from "gamezilla/app/@SHARED/data";
import { SpaceId } from "../@SHARED/data/space-id";
import { Space } from "./@SHARED";
import { EvtMeta, appendEvt } from "./@SHARED/evt";
import * as Game from "./game/game.core";

//
//
//
// Model
//
//
//

export type CoreModel = {
  spaces: {
    [spaceId: SpaceId]: SpaceModel;
  };
};

export const findSpaceByUserId = (
  model: CoreModel,
  userId: UserId
): Space | null => {
  for (const spaceId in model.spaces) {
    if (!SpaceId.is(spaceId)) {
      continue;
    }

    const space = model.spaces[spaceId];

    if (!space) {
      continue;
    }

    const state = toState(space);

    if (state.type === "initial") {
      continue;
    }

    if (state.type === "ended") {
      continue;
    }

    if (state.space.users[userId]) {
      return state.space;
    }
  }
  return null;
};

export const appendEvent = (
  model: CoreModel,
  evt: Evt & EvtMeta
): CoreModel => {
  const space = model.spaces[evt.spaceId] ?? {
    events: [],
    initialState: {
      type: "initial",
    },
  };

  const eventsNew = appendEvt(space.events, evt);

  return {
    spaces: {
      ...model.spaces,
      [evt.spaceId]: {
        ...space,
        events: eventsNew,
      },
    },
  };
};

export type SpaceModel = {
  events: (Evt & EvtMeta)[];
  initialState: State;
};

export type ServerModel = CoreModel & {
  games: {
    [spaceId: SpaceId]: Game.ServerModel;
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
    | (Evt & EvtMeta)
    | { t: "game-msg"; spaceId: SpaceId; c: Game.ToClient }
    | { t: "list"; spaces: CoreModel["spaces"] }
  );

export type ToServer = ToServerExtra &
  (
    | (Evt & EvtMeta)
    | { t: "game-msg"; spaceId: SpaceId; c: Game.ToServer }
    | { t: "list" }
  );

export type ToClientExtra = {
  profiles?: { [userId: UserId]: Profile };
};

export type ToServerExtra = {
  profile?: Profile | null;
};

export type ServerMsg = { t: "game-msg"; spaceId: SpaceId; c: Game.ServerMsg };

export type ClientMsg =
  | (Evt & EvtMeta)
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

export const reducer = (state: State, evt: Evt & EvtMeta): State => {
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

export const toState = (model: SpaceModel): State => {
  return model.events.reduce(reducer, model.initialState);
};
