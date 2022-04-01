import { createAction } from "@reduxjs/toolkit";
import { put, select, takeEvery } from "redux-saga/effects";
import { InferActionUnion } from "../../utils";

/**
 *
 *
 * State
 *
 *
 */

export type IGameId =
  | "tic-tac-toe"
  | "chess"
  | "connect-four"
  | "checkers"
  | "cards"
  | "battleship";

export const formatGameId = (gameId: IGameId) => {
  const capitalize = ([first, ...rest]: string) =>
    `${first.toUpperCase()}${rest.join("").toLowerCase()}`;

  return gameId.split("-").map(capitalize).join(" ");
};

export type IState =
  | {
      type: "stopped";
    }
  | {
      type: "started";
      gameId: IGameId;
      status: "focused" | "blurred";
    };

/**
 *
 *
 * Actions
 *
 *
 */

export const actions = {
  start: createAction<IGameId, "game/START">("game/START"),
  started: createAction<IGameId, "game/STARTED">("game/STARTED"),
  stopped: createAction("game/STOPPED"),
  focused: createAction("game/FOCUSED"),
  blurred: createAction("game/BLURRED"),
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
    case "game/STOPPED":
      return {
        type: "stopped",
      };

    case "game/STARTED":
      return {
        type: "started",
        gameId: action.payload,
        status: "blurred",
      };

    case "game/START":
      return state;

    case "game/FOCUSED":
      if (state.type === "started") {
        return {
          ...state,
          status: "focused",
        };
      }
      return state;

    case "game/BLURRED":
      if (state.type === "started") {
        return {
          ...state,
          status: "blurred",
        };
      }

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

export function* saga({ getState }: { getState: (state: unknown) => IState }) {
  yield takeEvery(actions.start, function* (action) {
    const state: IState = yield select(getState);

    if (state.type === "stopped") {
      yield put(actions.started(action.payload));
    }
  });
}
