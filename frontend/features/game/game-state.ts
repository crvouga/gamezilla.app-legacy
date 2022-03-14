import { createAction, createReducer } from "@reduxjs/toolkit";
import { eventChannel } from "redux-saga";
import { call, fork, put, takeEvery, takeLatest } from "redux-saga/effects";
import { createStorageLocalJSON } from "../../utils";
import * as GameDataAccess from "./game-data-access";

export type IState =
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
  connected: createAction<
    { sessionId: string; roomId: string },
    "game/connected"
  >("game/connected"),
  disconnected: createAction("game/disconnected"),
  reconnect: createAction<
    { sessionId: string; roomId: string },
    "game/reconnect"
  >("game/reconnect"),
  reconnectFailed: createAction("game/reconnect/failed"),
  reconnectSucceeded: createAction("game/reconnect/succeeded"),
  create: createAction("game/create"),
  leave: createAction("game/leave"),
  lefted: createAction("game/lefted"),
  join: createAction("game/join"),
  message: createAction("game/message"),
};

export const reducer = createReducer<IState>({ type: "loading" }, (builder) => {
  builder.addCase(actions.connected, () => {
    return { type: "connected" };
  });
  builder.addCase(actions.disconnected, () => {
    return { type: "disconnected" };
  });
  builder.addCase(actions.reconnectFailed, () => {
    return { type: "disconnected" };
  });
  builder.addCase(actions.lefted, () => {
    return { type: "disconnected" };
  });
});

/*



*/

export function* saga() {
  yield takeEvery(actions.connected, function* (action) {
    storage.write("gameRoomIds", action.payload);
  });

  yield takeLatest(actions.reconnect, function* (action) {
    const { roomId, sessionId } = action.payload;

    const result: Awaited<ReturnType<typeof GameDataAccess.reconnect>> =
      yield call(GameDataAccess.reconnect, {
        roomId,
        sessionId,
      });

    if (result.type === "success") {
      yield put(actions.reconnectSucceeded());
      yield fork(connectedSaga, result.data);
      return;
    }

    yield put(actions.reconnectFailed());
  });

  yield takeLatest(actions.create, function* () {
    const result: Awaited<ReturnType<typeof GameDataAccess.create>> =
      yield call(GameDataAccess.create);

    if (result.type === "success") {
      yield fork(connectedSaga, result.data);
    }
  });

  const storage =
    createStorageLocalJSON<{ roomId: string; sessionId: string }>();

  const found = storage.read("gameRoomIds");

  if (found) {
    yield put(actions.reconnect(found));
  } else {
    yield put(actions.disconnected());
  }
}

function* connectedSaga(room: GameDataAccess.IRoom) {
  yield put(
    actions.connected({
      roomId: room.id,
      sessionId: room.sessionId,
    })
  );

  const roomChannel = eventChannel<
    ReturnType<typeof actions.lefted> | ReturnType<typeof actions.message>
  >((emit) => {
    room.onLeave(() => {
      emit(actions.lefted());
    });

    room.onMessage("*", (type) => {
      emit(actions.message());
    });

    return () => {
      room.removeAllListeners();
    };
  });

  yield takeEvery(roomChannel, function* (action) {
    yield put(action);
  });

  yield takeEvery(actions.leave, function* () {
    yield call(() => room.leave());
  });
}
