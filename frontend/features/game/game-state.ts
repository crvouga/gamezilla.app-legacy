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

export type IState =
  | {
      type: "stopped";
    }
  | {
      type: "started";
      gameId: IGameId;
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
      };

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

export function* saga({ getState }: { getState: (state: unknown) => IState }) {
  yield takeEvery(actions.start, function* (action) {
    const state: IState = yield select(getState);

    if (state.type === "stopped") {
      yield put(actions.started(action.payload));
    }
  });
}
