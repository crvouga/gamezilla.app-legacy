import { Posix } from "gamezilla/@SHARED/core";
import { UserId } from "gamezilla/app/@SHARED/data";
import {
  ColumnIndex,
  Columns,
  EMPTY_COLUMNS,
  MoveProblem,
  PlayerType,
  dropDisc,
  toStatus,
  toTurn,
} from "../../@SHARED/connect-four/connect-four";
import { SpaceCtx } from "gamezilla/app/space/@SHARED";

//
//
//
// Model
//
//
//

export type ClientModel = {
  openedModal: "confirm-resign" | null;
  ghostIndex: ColumnIndex | null;
};

export type ServerModel = null;

//
//
//
// Msg
//
//
//

export type ServerMsg = { t: null };

export type ClientMsg =
  | { t: "hovered-over-columns"; columnIndex: ColumnIndex }
  | { t: "clicked-resign"; userId: UserId }
  | { t: "close-modal" };

export type ToServer = { t: null };

export type ToClient = { t: null };

//
//
//
//
//

export type GameEvent =
  //
  | { t: "user-stopped-playing"; userId: UserId }
  | { t: "user-started-playing"; userId: UserId; playerType: PlayerType }
  | {
      t: "user-inputted-move-time-limit";
      userId: UserId;
      moveTimeLimit: MoveTimeLimit;
    }
  | { t: "user-dropped-disc"; columnIndex: ColumnIndex; userId: UserId }
  | { t: "user-started-game"; userId: UserId }
  | { t: "user-stopped-game"; userId: UserId }
  | { t: "user-requested-rematch"; userId: UserId }
  | {
      t: "user-responded-to-rematch-request";
      userId: UserId;
      response: "Accept" | "Decline";
    }
  | { t: "user-cancelled-rematch"; userId: UserId }
  | { t: "user-resigned"; userId: UserId }
  | { t: "time-passed"; currentTime: Posix }
  | { t: "user-left"; userId: UserId };

type EventError = { t: "not-playing" } | { t: "move"; c: MoveProblem };

export type GameState = StateSetup | StateGame | StateGameOver;

export const initState = (ctx: SpaceCtx): GameState => {
  return {
    type: "setup",
    moveTimeLimit: 5,
    players: {
      "player-one": ctx.space.hostId,
      "player-two": null,
    },
    errors: {},
  };
};

type Errors = {
  errors: {
    [eventId: string]: GameEvent & { error: EventError };
  };
};

const addError = (
  state: GameState,
  event: GameEvent,
  error: EventError
): GameState => {
  return {
    ...state,
    errors: {
      ...state.errors,
      [JSON.stringify(event)]: { ...event, error },
    },
  };
};

export type StateSetup = Errors & {
  type: "setup";
  moveTimeLimit: MoveTimeLimit;
  players: {
    [playerType in PlayerType]: UserId | null;
  };
};

export type StateGame = Errors & {
  type: "game";
  moveTimeLimit: MoveTimeLimit;
  columns: Columns;
  gameId: number;
  lastMoveAt: Posix;
  players: {
    [playerType in PlayerType]: UserId;
  };
};

export type StateGameOver = Errors & {
  type: "game-over";
  moveTimeLimit: MoveTimeLimit;
  columns: Columns;
  gameId: number;
  gameOver: GameOver;
  rematch: Rematch;
  players: {
    [playerType in PlayerType]: UserId;
  };
};
export type Rematch =
  | {
      type: "NotAsking";
    }
  | {
      type: "Asking";
      asker: PlayerType;
    };

export type GameOver =
  | {
      type: "Draw";
    }
  | {
      type: "Winner";
      winner: PlayerType;
    }
  | {
      type: "resignation";
      resigner: PlayerType;
    };

export const toGameOver = (state: GameState): GameOver | { type: "none" } => {
  if (state.type === "setup") {
    return { type: "none" };
  }

  const status = toStatus(state.columns);

  if (status.type === "Tie") {
    return { type: "Draw" };
  }

  if (status.type === "Winner") {
    return { type: "Winner", winner: status.winner };
  }

  return { type: "none" };
};

export type MoveTimeLimit = 5 | 7 | 9;

export const allMoveTimeLimit: {
  [moveTimeLimit in MoveTimeLimit]: MoveTimeLimit;
} = {
  "5": 5,
  "7": 7,
  "9": 9,
};

export const reducer = (state: GameState, event: GameEvent): GameState => {
  switch (state.type) {
    case "setup": {
      switch (event.t) {
        case "user-started-playing": {
          if (state.players[event.playerType] !== null) {
            return addError(state, event, { t: "not-playing" });
          }

          return {
            ...state,
            players: {
              ...state.players,
              [event.playerType]: event.userId,
            },
          };
        }

        case "user-stopped-playing": {
          const playerType = toPlayerType(event.userId, state);

          if (!playerType) {
            return addError(state, event, { t: "not-playing" });
          }

          return {
            ...state,
            players: {
              ...state.players,
              [playerType]: null,
            },
          };
        }

        case "user-inputted-move-time-limit": {
          return {
            ...state,
            moveTimeLimit: event.moveTimeLimit,
          };
        }

        case "user-started-game": {
          const playerOne = state.players["player-one"];
          const playerTwo = state.players["player-two"];

          if (!playerOne || !playerTwo) {
            return addError(state, event, { t: "not-playing" });
          }

          return {
            errors: state.errors,
            type: "game",
            columns: EMPTY_COLUMNS,
            moveTimeLimit: state.moveTimeLimit,
            lastMoveAt: Posix.now(),
            gameId: 0,
            players: {
              "player-one": playerOne,
              "player-two": playerTwo,
            },
          };
        }

        default: {
          return state;
        }
      }
    }

    case "game": {
      switch (event.t) {
        case "user-dropped-disc": {
          const turn = toTurn(state.columns);

          const dropped = dropDisc(state.columns, event.columnIndex, turn);

          if (dropped.t === "err") {
            return addError(state, event, { t: "move", c: dropped.error });
          }

          return {
            ...state,
            columns: dropped.value,
            // lastMoveAt: event.happenedAt,
          };
        }

        case "user-resigned": {
          const resignedPlayer = toPlayerType(event.userId, state);

          if (!resignedPlayer) {
            return addError(state, event, { t: "not-playing" });
          }

          return {
            ...state,
            type: "game-over",
            gameOver: { type: "resignation", resigner: resignedPlayer },
            rematch: { type: "NotAsking" },
          };
        }

        case "time-passed": {
          return state;
        }
      }
      return state;
    }

    case "game-over": {
      return state;
    }
  }
};

export const toState = (events: GameEvent[], state: GameState): GameState => {
  const stateNew = events.reduce(reducer, state);
  return stateNew;
};

export const toPlayerType = (
  userId: UserId,
  state: GameState
): PlayerType | null => {
  if (state.players["player-one"] === userId) {
    return "player-one";
  }

  if (state.players["player-two"] === userId) {
    return "player-two";
  }

  return null;
};
