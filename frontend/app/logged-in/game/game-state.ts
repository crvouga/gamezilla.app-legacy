import { eventChannel } from "redux-saga";
import { call, put, takeEvery } from "redux-saga/effects";
import {
  Action,
  ActionType,
  createStorageLocalJSON,
  InferActionMap,
  InferActionUnion,
  isActions,
} from "../../../utils";
import * as GameDataAccess from "./game-data-access";

export type IState =
  | {
      type: "connected";
      route:
        | {
            type: "home";
          }
        | {
            type: "leave";
          };
      messages: {
        type: string;
      }[];
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

export const actions = {
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

export type IAction = InferActionUnion<typeof actions>;

export const isAction = (action: unknown): action is IAction => {
  return isActions(actions, action);
};

export type IActionMap = InferActionMap<typeof actions>;

export const reducer = (state: IState, action: IAction): IState => {
  switch (action.type) {
    case ActionType("game", "message"):
      return {
        route: {
          type: "home",
        },
        ...state,
        type: "connected",
        messages: [
          ...(state.type === "connected" ? state.messages : []),
          action.payload,
        ],
      };
    case ActionType("game", "connected"):
      return {
        type: "connected",
        route: {
          type: "home",
        },
        messages: [],
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
        route: {
          type: "home",
        },
        messages: [],
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

export function* saga() {
  yield takeEvery(actions.connected, watchConnected);
  yield takeEvery(actions.reconnectFailed, watchReconnectFailed);
  yield takeEvery(actions.reconnect, watchReconnect);
  yield takeEvery(actions.create, watchCreate);

  yield put(actions.reconnect());
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
    yield put(actions.reconnectFailed());
    return;
  }

  const result: Awaited<ReturnType<typeof GameDataAccess.reconnect>> =
    yield call(GameDataAccess.reconnect, found);

  if (result.type === "error") {
    yield put(actions.reconnectFailed());

    return;
  }

  yield put(actions.reconnectSucceeded());

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
      emit(actions.left());
    });

    room.onMessage("*", (type) => {
      emit(actions.message({ type: String(type) }));
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
    actions.connected({
      sessionId: room.sessionId,
      roomId: room.id,
    })
  );
  const roomChan = createRoomChan(room);
  yield takeEvery(roomChan, watchRoomChan);
  yield takeEvery(actions.leave, watchLeave, room);
}
