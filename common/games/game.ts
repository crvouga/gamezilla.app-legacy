import { Actions, createAction, Dispatch, Middleware } from "@reduxjs/toolkit";
import {
  actionChannel,
  call,
  fork,
  put,
  race,
  select,
  take,
  takeEvery,
  takeLatest,
} from "redux-saga/effects";
import { InferActionUnion } from "../utils/action-creator";
import * as TicTacToe from "./tic-tac-toe/tic-tac-toe";
import * as ConnectFour from "./connect-four/connect-four";

/**
 *
 *
 * State
 *
 *
 */

export type IGameState =
  | {
      gameName: "tic-tac-toe";
      gameState: TicTacToe.IState;
    }
  | {
      gameName: "connect-four";
      gameState: ConnectFour.IState;
    };

export const formatGameName = (name: IGameState["gameName"]) =>
  name
    .split("-")
    .map(([x, ...xs]) => [x.toLowerCase(), xs.join("").toLowerCase()].join(""))
    .join(" ");

export type IState =
  | {
      type: "stopped";
    }
  | ({
      status: "focused" | "focusing" | "blurred";
      type: "started";
    } & IGameState);

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
  start: createAction<IGameState["gameName"], "game/START">("game/START"),
  started: createAction<IGameState["gameName"], "game/STARTED">("game/STARTED"),
  stop: createAction("game/STOP"),
  stopped: createAction("game/STOPPED"),
  focused: createAction("game/FOCUSED"),
  focus: createAction("game/FOCUS"),
  blurred: createAction("game/BLURRED"),
};

export type IAction =
  | InferActionUnion<typeof actions>
  | TicTacToe.IAction
  | ConnectFour.IAction;

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
      switch (action.payload) {
        case "tic-tac-toe":
          return {
            type: "started",
            status: "focusing",
            gameName: "tic-tac-toe",
            gameState: TicTacToe.initialState,
          };

        case "connect-four":
          return {
            type: "started",
            status: "focusing",
            gameName: "connect-four",
            gameState: ConnectFour.initialState,
          };
      }

    case "game/START":
      return state;

    case "tic-tac-toe/BOARD_PRESSED":
    case "tic-tac-toe/MOVED":
    case "tic-tac-toe/RESTART":
      if (state.type === "started" && state.gameName === "tic-tac-toe") {
        return {
          ...state,
          gameState: TicTacToe.reducer(state.gameState, action),
        };
      }

      return state;

    case "connect-four/COLUMN_PRESSED":
    case "connect-four/MOVED":
      if (state.type === "started" && state.gameName === "connect-four") {
        return {
          ...state,
          gameState: ConnectFour.reducer(state.gameState, action),
        };
      }

      return state;
  }
};

/*
 

Middleware


*/

function* startFlow() {
  const action: ReturnType<typeof actions.start> = yield take(actions.start);

  yield put(actions.started(action.payload));

  while (true) {
    yield take(actions.stopped);

    const action: ReturnType<typeof actions.start> = yield take(actions.start);

    yield put(actions.started(action.payload));
  }
}

function* stopFlow() {
  while (true) {
    yield take(actions.started);

    yield take(actions.stop);

    yield put(actions.stopped());
  }
}

function* focusFlow() {
  while (true) {
    const started: ReturnType<typeof actions.started> = yield take(
      actions.started
    );

    yield race([
      take(actions.stopped),
      function* () {
        while (true) {
          console.log("WATING START");
          const start: ReturnType<typeof actions.start> = yield take(
            actions.start
          );

          console.log("COMPARING");
          if (started.payload === start.payload) {
            yield put(actions.focus());
          }
        }
      },
    ]);
  }
}

function* gameFlow() {
  while (true) {
    const started: ReturnType<typeof actions.started> = yield take(
      actions.started
    );

    yield race([
      actions.stopped,
      function* () {
        switch (started.payload) {
          case "connect-four":
            return;

          case "tic-tac-toe":
            return;
        }
      },
    ]);
  }
}

export function* saga() {
  yield fork(startFlow);
  yield fork(stopFlow);
  yield fork(focusFlow);
  yield fork(gameFlow);
}
