import { createAction } from "@reduxjs/toolkit";
import { put, select, takeEvery, takeLatest } from "redux-saga/effects";
import { InferActionUnion } from "../utils/action-creator";
import * as TicTacToe from "./tic-tac-toe/tic-tac-toe";

/**
 *
 *
 * State
 *
 *
 */

export type IGameState = {
  name: "tic-tac-toe";
  state: TicTacToe.IState;
};

export const formatGameName = (name: IGameState["name"]) =>
  name
    .split("-")
    .map(([x, ...xs]) => [x.toLowerCase(), xs.join("").toLowerCase()].join(""))
    .join(" ");

export type IState =
  | {
      type: "stopped";
    }
  | {
      status: "focused" | "focusing" | "blurred";
      type: "started";
      game: IGameState;
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
  start: createAction<IGameState["name"], "game/START">("game/START"),
  started: createAction<IGameState["name"], "game/STARTED">("game/STARTED"),
  stop: createAction("game/STOP"),
  stopped: createAction("game/STOPPED"),
  focused: createAction("game/FOCUSED"),
  focus: createAction("game/FOCUS"),
  blurred: createAction("game/BLURRED"),

  ...TicTacToe.actions,
};

export type IAction = InferActionUnion<typeof actions>;

/**
 *
 *
 * Reducer
 *
 *
 */

export const reducer = (state: IState, action: IAction): IState => {
  switch (action.type) {
    case "game/FOCUS":
      return state.type === "stopped"
        ? state
        : {
            ...state,
            status: "focusing",
          };

    case "game/FOCUSED":
      return state.type === "stopped"
        ? state
        : {
            ...state,
            status: "focused",
          };

    case "game/BLURRED":
      return state.type === "stopped"
        ? state
        : {
            ...state,
            status: "blurred",
          };

    case "game/STOP":
      return state;

    case "game/STOPPED":
      return {
        type: "stopped",
      };

    case "game/STARTED":
      if (action.payload === "tic-tac-toe") {
        return {
          type: "started",
          status: "focusing",
          game: {
            name: "tic-tac-toe",
            state: TicTacToe.initialState,
          },
        };
      }

      return state;

    case "tic-tac-toe/BOARD_PRESSED":
    case "tic-tac-toe/MOVED":
    case "tic-tac-toe/RESTART":
      if (state.type === "started" && state.game.name === "tic-tac-toe") {
        return {
          ...state,
          game: {
            ...state.game,
            state: TicTacToe.reducer(state.game.state, action),
          },
        };
      }

      return state;

    case "game/START":
      return state;
  }
};

/**
 *
 *
 * Saga
 *
 *
 */

export function* saga({ selector }: { selector: (_: unknown) => IState }) {
  yield takeEvery(actions.start, function* (action) {
    const state: IState = yield select(selector);

    if (state.type === "stopped") {
      yield put(actions.started(action.payload));
    }

    yield put(actions.focus());
  });

  yield takeEvery(actions.stop, function* () {
    const state: IState = yield select(selector);

    if (state.type === "started") {
      yield put(actions.stopped());
    }
  });

  yield takeLatest(actions.started, function* (action) {
    if (action.payload === "tic-tac-toe") {
      yield* TicTacToe.saga({
        selector: (_) => {
          const state = selector(_);

          if (state.type === "started") {
            return state.game.state;
          }

          return TicTacToe.initialState;
        },
      });
    }
  });
}
