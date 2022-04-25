import { createAction } from "@reduxjs/toolkit";
import { call, race, take, takeLeading } from "redux-saga/effects";
import { InferActionMap, InferActionUnion } from "../utils";
import * as ConnectFour from "./connect-four/connect-four";
import * as TicTacToe from "./tic-tac-toe/tic-tac-toe";

/**
 *
 *
 * State
 *
 *
 */

export type IGame =
  | {
      type: "tic-tac-toe";
      name: string;
      state: TicTacToe.IState;
    }
  | {
      type: "connect-four";
      name: string;
      state: ConnectFour.IState;
    };

type IStatus = "focused" | "focusing" | "blurred";

export type IState =
  | {
      type: "stopped";
    }
  | {
      type: "started";
      status: IStatus;
      game: IGame;
    };

export const initialState: IState = {
  type: "stopped",
};

/**
 *
 *
 * Actions
 *
 *
 */

export const actions = {
  started: createAction<IGame["type"], "game/STARTED">("game/STARTED"),
  stopped: createAction("game/STOPPED"),
  focused: createAction("game/FOCUSED"),
  focus: createAction("game/FOCUS"),
  blurred: createAction("game/BLURRED"),
};

export type IAction =
  | InferActionUnion<typeof actions>
  | TicTacToe.IAction
  | ConnectFour.IAction;

const statusReducer = (
  game: IGame,
  status: IStatus,
  action: IAction
): IStatus => {
  switch (action.type) {
    case "game/STARTED":
      if (game.type === action.payload) {
        return "focusing";
      }

      return status;

    case "game/BLURRED":
      return "blurred";

    case "game/FOCUS":
      return "focusing";

    case "game/FOCUSED":
      return "focused";

    default:
      return status;
  }
};

const gameReducer = (game: IGame, action: IAction): IGame => {
  switch (game.type) {
    case "connect-four":
      switch (action.type) {
        case "connect-four/COLUMNS_CLEARED":
        case "connect-four/COLUMN_PRESSED":
          return {
            ...game,
            state: ConnectFour.reducer(game.state, action),
          };

        default:
          return game;
      }

    case "tic-tac-toe":
      switch (action.type) {
        case "tic-tac-toe/BOARD_PRESSED":
        case "tic-tac-toe/RESTART":
          return {
            ...game,
            state: TicTacToe.reducer(game.state, action),
          };

        default:
          return game;
      }
  }
};

export const reducer = (state: IState, action: IAction): IState => {
  switch (state.type) {
    case "started":
      switch (action.type) {
        case "game/STOPPED":
          return {
            type: "stopped",
          };

        default:
          return {
            type: "started",
            status: statusReducer(state.game, state.status, action),
            game: gameReducer(state.game, action),
          };
      }

    case "stopped":
      switch (action.type) {
        case "game/STARTED":
          return {
            type: "started",
            status: "focusing",
            game:
              action.payload === "connect-four"
                ? {
                    type: "connect-four",
                    name: "Connect Four",
                    state: ConnectFour.initialState,
                  }
                : {
                    type: "tic-tac-toe",
                    name: "Tic Tac Toe",
                    state: TicTacToe.initialState,
                  },
          };

        default:
          return state;
      }
  }
};

/*
 

Middleware


*/

export function* saga() {
  yield takeLeading(actions.started, startedFlow);
}

type IActionMap = InferActionMap<typeof actions>;

function* startedFlow(action: IActionMap["started"]) {
  yield race([take(actions.stopped), call(gameFlow, action.payload)]);
}

function* gameFlow(gameType: IGame["type"]) {
  switch (gameType) {
    case "connect-four":
      yield* ConnectFour.saga();

    case "tic-tac-toe":
      yield* TicTacToe.saga();
  }
}
