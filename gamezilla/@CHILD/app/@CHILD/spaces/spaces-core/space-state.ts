import { Space } from "gamezilla/@CHILD/app/@CHILD/spaces/@SHARED/space";
import { UserId } from "gamezilla/@CHILD/app/@SHARED/data";
import * as Game from "../@CHILD/game/game.core";
import { EventId, EventMeta } from "../@SHARED/event";
import { SpaceEvent } from "./space-event";

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
  game: Game.ModelGame | null;
  latestEvent: EventId;
};

export type Ended = Space & {
  type: "ended";
  latestEvent: EventId;
};

export type State = Initial | Started | Ended;

export const init: State = {
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
  msgSpace,
}: {
  state: State;
  msgSpace: SpaceEvent & EventMeta;
}): State => {
  switch (state.type) {
    case "ended": {
      return state;
    }

    case "initial": {
      switch (msgSpace.t) {
        case "user-started-space": {
          return {
            type: "started",
            game: null,
            hostId: msgSpace.userId,
            latestEvent: msgSpace.eventId,
            spaceId: msgSpace.spaceId,
            users: {
              [msgSpace.userId]: msgSpace.userId,
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
      switch (msgSpace.t) {
        case "game": {
          const game = state.game ?? Game.initGame(msgSpace.c.t);
          const gameNew = Game.reducer({
            ctx: { space: state },
            modelGame: game,
            msgGame: { ...msgSpace, ...msgSpace.c },
          });
          return {
            ...state,
            latestEvent: msgSpace.eventId,
            game: gameNew,
          };
        }
        case "user-ended-space": {
          if (msgSpace.userId !== state.hostId) {
            return state;
          }
          return {
            ...state,
            latestEvent: msgSpace.eventId,
            type: "ended",
          };
        }

        case "user-inputted-game": {
          return {
            ...state,
            latestEvent: msgSpace.eventId,
            game: msgSpace.game ? Game.initGame(msgSpace.game) : null,
          };
        }

        case "user-joined-space": {
          return {
            ...state,
            latestEvent: msgSpace.eventId,
            users: {
              ...state.users,
              [msgSpace.userId]: msgSpace.userId,
            },
          };
        }

        case "user-left-space": {
          if (msgSpace.userId === state.hostId) {
            return state;
          }
          const usersNew = { ...state.users };
          delete usersNew[msgSpace.userId];
          return {
            ...state,
            latestEvent: msgSpace.eventId,
            users: usersNew,
          };
        }

        case "user-started-space": {
          return { ...state, latestEvent: msgSpace.eventId };
        }
      }
    }
  }
};
