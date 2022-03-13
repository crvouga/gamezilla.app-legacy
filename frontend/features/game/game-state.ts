import { Action, createAction } from "@reduxjs/toolkit";
import { put, takeLeading } from "redux-saga/effects";
import { createStorageLocalJSON, IStorage } from "../../utils";

const namespace = "game" as const;

export type IGameState =
  | {
      type: "connected";
    }
  | {
      type: "disconnected";
    }
  | {
      type: "loading";
    };

export const actions = {
  connected: createAction(`${namespace}/connected`),
  disconnected: createAction(`${namespace}/disconnected`),
  reconnect: createAction<{ roomId: string; sessionId: string }>(
    `${namespace}/reconnect`
  ),
  reconnectSucceeded: createAction(`${namespace}/reconnect/succeeded`),
  reconnectFailed: createAction(`${namespace}/reconnect/failed`),
};

const initialState: IGameState = {
  type: "loading",
};

export const reducer = (state: IGameState, action: Action): IGameState => {
  if (actions.connected.match(action)) {
    return {
      type: "connected",
    };
  }

  if (actions.disconnected.match(action)) {
    return {
      type: "disconnected",
    };
  }

  return state;
};

export const game = {
  initialState,
  namespace,
  reducer,
  actions,
};

function* reconnectSaga(action: ReturnType<typeof actions.reconnect>) {}

export function* gameSaga() {
  const storage =
    createStorageLocalJSON<{ roomId: string; sessionId: string }>();

  const found = storage.read("gameRoomIds");

  if (found) {
    yield put(actions.reconnect(found));
  }

  yield takeLeading(actions.reconnect, reconnectSaga);
}
