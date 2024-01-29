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
  game: Game.ModelGame | null;
  latestEvent: EventId;
};

export type Ended = Space & {
  type: "ended";
  latestEvent: EventId;
};

export type State = Initial | Started | Ended;

export const initGame: State = {
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
  msgEvt,
}: {
  state: State;
  msgEvt: SpaceEvent & EventMeta;
}): State => {
  switch (state.type) {
    case "ended": {
      return state;
    }

    case "initial": {
      switch (msgEvt.t) {
        case "user-started-space": {
          return {
            type: "started",
            game: null,
            hostId: msgEvt.userId,
            latestEvent: msgEvt.msgEvtId,
            spaceId: msgEvt.spaceId,
            users: {
              [msgEvt.userId]: msgEvt.userId,
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
      switch (msgEvt.t) {
        case "game": {
          const game = state.game ?? Game.initGame(msgEvt.c.t);
          const gameNew = Game.reducer({
            ctx: { space: state },
            modelGame: game,
            msgEvt: { ...msgEvt, ...msgEvt.c },
          });
          return {
            ...state,
            latestEvent: msgEvt.msgEvtId,
            game: gameNew,
          };
        }
        case "user-ended-space": {
          if (msgEvt.userId !== state.hostId) {
            return state;
          }
          return {
            ...state,
            latestEvent: msgEvt.msgEvtId,
            type: "ended",
          };
        }

        case "user-inputted-game": {
          return {
            ...state,
            latestEvent: msgEvt.msgEvtId,
            game: msgEvt.game ? Game.initGame(msgEvt.game) : null,
          };
        }

        case "user-joined-space": {
          return {
            ...state,
            latestEvent: msgEvt.msgEvtId,
            users: {
              ...state.users,
              [msgEvt.userId]: msgEvt.userId,
            },
          };
        }

        case "user-left-space": {
          if (msgEvt.userId === state.hostId) {
            return state;
          }
          const usersNew = { ...state.users };
          delete usersNew[msgEvt.userId];
          return {
            ...state,
            latestEvent: msgEvt.msgEvtId,
            users: usersNew,
          };
        }

        case "user-started-space": {
          return { ...state, latestEvent: msgEvt.msgEvtId };
        }
      }
    }
  }
};
