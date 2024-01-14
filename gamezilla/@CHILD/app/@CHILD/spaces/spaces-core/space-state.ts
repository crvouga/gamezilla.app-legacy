import { Space } from "gamezilla/@CHILD/app/@CHILD/spaces/@SHARED/space";
import * as Game from "../@CHILD/game/game.core";
import { EventId, EventMeta } from "../@SHARED/event";
import { SpaceEvent } from "./space-event";
import { UserId } from "gamezilla/@CHILD/app/@SHARED/data";

//
//
//
//
//

export type Initial = {
  type: "initial";
};

export type Started = Space & {
  type: "started";
  game: Game.GameState | null;
  latestEvent: EventId;
};

export type Ended = Space & {
  type: "ended";
  latestEvent: EventId;
};

export type State = Initial | Started | Ended;

export const initState: State = {
  type: "initial",
};

//
//
//
//
//

export const toUserIds = (state: State): UserId[] => {
  switch (state.type) {
    case "initial":
    case "ended": {
      return [];
    }

    case "started": {
      return Object.values(state.users);
    }
  }
};

//
//
//
//
//
//

export const reducer = ({
  state,
  event,
}: {
  state: State;
  event: SpaceEvent & EventMeta;
}): State => {
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
            latestEvent: event.eventId,
            game: gameNew,
          };
        }
        case "user-ended-space": {
          if (event.userId !== state.hostId) {
            return state;
          }
          return {
            ...state,
            latestEvent: event.eventId,
            type: "ended",
          };
        }

        case "user-inputted-game": {
          return {
            ...state,
            latestEvent: event.eventId,
            game: event.game ? Game.initState(event.game) : null,
          };
        }

        case "user-joined-space": {
          return {
            ...state,
            latestEvent: event.eventId,
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
            latestEvent: event.eventId,
            users: usersNew,
          };
        }

        case "user-started-space": {
          return { ...state, latestEvent: event.eventId };
        }
      }
    }
  }
};
