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
  msgEvent,
}: {
  state: State;
  msgEvent: SpaceEvent & EventMeta;
}): State => {
  switch (state.type) {
    case "ended": {
      return state;
    }

    case "initial": {
      switch (msgEvent.t) {
        case "user-started-space": {
          return {
            type: "started",
            game: null,
            hostId: msgEvent.userId,
            latestEvent: msgEvent.msgEventId,
            spaceId: msgEvent.spaceId,
            users: {
              [msgEvent.userId]: msgEvent.userId,
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
      switch (msgEvent.t) {
        case "game": {
          const game = state.game ?? Game.initState(msgEvent.c.t);
          const gameNew = Game.reducer({
            ctx: { space: state },
            state: game,
            msgEvent: { ...msgEvent, ...msgEvent.c },
          });
          return {
            ...state,
            latestEvent: msgEvent.msgEventId,
            game: gameNew,
          };
        }
        case "user-ended-space": {
          if (msgEvent.userId !== state.hostId) {
            return state;
          }
          return {
            ...state,
            latestEvent: msgEvent.msgEventId,
            type: "ended",
          };
        }

        case "user-inputted-game": {
          return {
            ...state,
            latestEvent: msgEvent.msgEventId,
            game: msgEvent.game ? Game.initState(msgEvent.game) : null,
          };
        }

        case "user-joined-space": {
          return {
            ...state,
            latestEvent: msgEvent.msgEventId,
            users: {
              ...state.users,
              [msgEvent.userId]: msgEvent.userId,
            },
          };
        }

        case "user-left-space": {
          if (msgEvent.userId === state.hostId) {
            return state;
          }
          const usersNew = { ...state.users };
          delete usersNew[msgEvent.userId];
          return {
            ...state,
            latestEvent: msgEvent.msgEventId,
            users: usersNew,
          };
        }

        case "user-started-space": {
          return { ...state, latestEvent: msgEvent.msgEventId };
        }
      }
    }
  }
};
