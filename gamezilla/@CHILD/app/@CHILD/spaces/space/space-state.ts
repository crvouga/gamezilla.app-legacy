import { Space } from "gamezilla/@CHILD/app/@CHILD/spaces/@SHARED/space";
import * as Game from "../@CHILD/game/game.core";
import { EventId, EventMeta } from "../@SHARED/event";
import { SpaceEvent } from "../space-event";

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

export const initState = (): StateSpace => {
  return {
    type: "initial",
  };
};

export const reducer = ({
  state,
  event,
}: {
  state: StateSpace;
  event: SpaceEvent & EventMeta;
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
            game: null,
            hostId: event.userId,
            latestEvent: event.eventId,
            spaceId: event.spaceId,
            users: {
              [event.userId]: event.userId,
            },
            visibility: "public",
          };
        }
        default: {
          return state;
        }
      }
    }

    case "started": {
      switch (event.t) {
        case "game": {
          const game = state.game ?? Game.initState(event.c.t);
          const gameNew = Game.reducer({
            ctx: { space: state },
            state: game,
            event: { ...event, ...event.c },
          });
          return {
            ...state,
            game: gameNew,
          };
        }
        case "user-ended-space": {
          if (event.userId !== state.hostId) {
            return state;
          }
          return {
            ...state,
            type: "ended",
          };
        }

        case "user-inputted-game": {
          return {
            ...state,
            game: event.game ? Game.initState(event.game) : null,
          };
        }

        case "user-joined-space": {
          return {
            ...state,
            users: {
              ...state.users,
              [event.userId]: event.userId,
            },
          };
        }

        case "user-left-space": {
          if (event.userId === state.hostId) {
            return state;
          }
          const usersNew = { ...state.users };
          delete usersNew[event.userId];
          return {
            ...state,
            users: usersNew,
          };
        }

        case "user-started-space": {
          return state;
        }
      }
    }
  }
};
