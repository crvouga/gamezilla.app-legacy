import { eventChannel } from "redux-saga";
import { call, put, take, takeEvery } from "redux-saga/effects";
import {
  Action,
  ActionType,
  createStorageLocalJSON,
  InferActionMap,
  InferActionUnion,
} from "../../utils";
import { IProfile } from "../profile/profile-data-access";
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

export const initialState: IState = {
  type: "loading",
};

/**
 *
 *
 *
 *
 */

export const Actions = {
  connected: Action<"game", "connected", { sessionId: string; roomId: string }>(
    "game",
    "connected"
  ),
  disconnected: Action("game", "disconnected"),
  reconnect: Action("game", "reconnect"),
  reconnectSucceeded: Action("game", "reconnect-succeeded"),
  reconnectFailed: Action("game", "reconnect-failed"),
  create: Action("game", "create"),
  join: Action("game", "join"),
  leave: Action("game", "leave"),
  left: Action("game", "left"),
  message: Action<"game", "message", { type: string }>("game", "message"),
};

export type IAction = InferActionUnion<typeof Actions>;
export type IActionMap = InferActionMap<typeof Actions>;

export const reducer = (state: IState, action: IAction): IState => {
  switch (action.type) {
    case ActionType("game", "connected"):
      return {
        type: "connected",
      };

    case ActionType("game", "disconnected"):
      return {
        type: "disconnected",
      };

    case ActionType("game", "left"):
      return {
        type: "disconnected",
      };

    case ActionType("game", "reconnect-failed"):
      return {
        type: "disconnected",
      };

    case ActionType("game", "reconnect-succeeded"):
      return {
        type: "connected",
      };

    default:
      return state;
  }
};

/**
 *
 *
 *
 *
 */

export function* saga({ profile }: { profile: IProfile }) {
  yield takeEvery(Actions.connected, watchConnected);
  yield takeEvery(Actions.reconnectFailed, watchReconnectFailed);
  yield takeEvery(Actions.reconnect, watchReconnect);
  yield takeEvery(Actions.create, watchCreate);

  yield put(Actions.reconnect());
}

const storageKey = "gameRoomIds";

const storage = createStorageLocalJSON<{ roomId: string; sessionId: string }>();

function* watchConnected(action: IActionMap["connected"]) {
  yield call(storage.write, storageKey, action.payload);
}

function* watchReconnectFailed() {
  yield call(storage.write, storageKey, null);
}

function* watchReconnect() {
  const found: ReturnType<typeof storage.read> = yield call(
    storage.read,
    "gameRoomIds"
  );

  if (!found) {
    yield put(Actions.reconnectFailed());
    return;
  }

  const result: Awaited<ReturnType<typeof GameDataAccess.reconnect>> =
    yield call(GameDataAccess.reconnect, found);

  if (result.type === "error") {
    yield put(Actions.reconnectFailed());

    return;
  }

  yield put(Actions.reconnectSucceeded());

  const room = result.data;

  yield* roomFlow(room);
}

function* watchCreate(action: IActionMap["create"]) {
  const result: Awaited<ReturnType<typeof GameDataAccess.create>> = yield call(
    GameDataAccess.create
  );

  if (result.type === "success") {
    const room = result.data;

    yield* roomFlow(room);
  }
}

const createRoomChan = (room: GameDataAccess.IRoom) => {
  return eventChannel<IAction>((emit) => {
    room.onLeave(() => {
      emit(Actions.left());
    });

    room.onMessage("*", (type) => {
      emit(Actions.message({ type: String(type) }));
    });

    return () => {
      room.removeAllListeners();
    };
  });
};

function* watchRoomChan(action: IAction) {
  yield put(action);
}

function* watchLeave(room: GameDataAccess.IRoom) {
  yield call(() => room.leave(true));
}

function* roomFlow(room: GameDataAccess.IRoom) {
  yield put(
    Actions.connected({
      sessionId: room.sessionId,
      roomId: room.id,
    })
  );
  const roomChan = createRoomChan(room);
  yield takeEvery(roomChan, watchRoomChan);
  yield takeEvery(Actions.leave, watchLeave, room);
}
