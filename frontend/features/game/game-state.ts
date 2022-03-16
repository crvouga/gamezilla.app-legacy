import { eventChannel } from "redux-saga";
import { call, put, takeEvery } from "redux-saga/effects";
import { createStorageLocalJSON } from "../../utils";
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

export enum ActionType {
  Connected = "game/connected",
  Disconnected = "game/disconnected",
  Reconnect = "game/reconnect",
  ReconnectFailed = "game/reconnect/failed",
  ReconnectSucceeded = "game/reconnect/succeeded",
  Create = "game/create",
  Join = "game/join",
  Leave = "game/leave",
  Lefted = "game/lefted",
  Message = "game/message",
}

type IConnected = {
  namespace: "game";
  type: ActionType.Connected;
  payload: {
    sessionId: string;
    roomId: string;
  };
};

type IReconnectSucceeded = {
  namespace: "game";
  type: ActionType.ReconnectSucceeded;
  payload: {
    sessionId: string;
    roomId: string;
  };
};

export type IAction =
  | IConnected
  | {
      namespace: "game";
      type: ActionType.Message;
      payload: {
        type: string;
      };
    }
  | {
      namespace: "game";
      type: ActionType.Lefted;
    }
  | {
      namespace: "game";
      type: ActionType.Disconnected;
    }
  | {
      namespace: "game";
      type: ActionType.Create;
    }
  | {
      namespace: "game";
      type: ActionType.Join;
    }
  | {
      namespace: "game";
      type: ActionType.Leave;
    }
  | {
      namespace: "game";
      type: ActionType.Reconnect;
    }
  | {
      namespace: "game";
      type: ActionType.ReconnectFailed;
      payload: {
        reason: string;
      };
    }
  | IReconnectSucceeded;

export const initialState: IState = {
  type: "loading",
};

export const reducer = (state: IState, action: IAction): IState => {
  switch (action.type) {
    case ActionType.Connected:
      return {
        type: "connected",
      };

    case ActionType.Disconnected:
      return {
        type: "disconnected",
      };

    default:
      return state;
  }
};

/*



*/

const storageKey = "gameRoomIds";

const storage = createStorageLocalJSON<{ roomId: string; sessionId: string }>();

function* watchConnected(action: IConnected) {
  yield call(storage.write, storageKey, action.payload);
}

function* watchDisconnected() {
  yield call(storage.write, storageKey, null);
}

function* watchReconnectFailed() {
  yield put<IAction>({ namespace: "game", type: ActionType.Disconnected });
}

function* watchReconnectSucceeded(action: IReconnectSucceeded) {
  yield put<IAction>({
    namespace: "game",
    type: ActionType.Connected,
    payload: action.payload,
  });
}

function* watchReconnect() {
  const found: ReturnType<typeof storage.read> = yield call(
    storage.read,
    "gameRoomIds"
  );

  if (!found) {
    yield put<IAction>({
      namespace: "game",
      type: ActionType.ReconnectFailed,
      payload: {
        reason: "Game room ids where not in storage",
      },
    });
    return;
  }

  const result: Awaited<ReturnType<typeof GameDataAccess.reconnect>> =
    yield call(GameDataAccess.reconnect, found);

  if (result.type === "error") {
    yield put<IAction>({
      namespace: "game",
      type: ActionType.ReconnectFailed,
      payload: {
        reason: result.errors.map((e) => e.message).join(", "),
      },
    });

    return;
  }

  yield put<IAction>({
    namespace: "game",
    type: ActionType.ReconnectSucceeded,
    payload: found,
  });

  const room = result.data;

  yield* roomFlow(room);
}

function* watchCreate() {
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
      emit({
        namespace: "game",
        type: ActionType.Lefted,
      });
    });

    room.onMessage("*", (type) => {
      emit({
        namespace: "game",
        type: ActionType.Message,
        payload: {
          type: String(type),
        },
      });
    });

    return () => {
      room.removeAllListeners();
    };
  });
};

function* watchRoomChan(action: IAction) {
  yield put<IAction>(action);
}

function* watchLeave(room: GameDataAccess.IRoom) {
  yield call(() => room.leave(true));
}

function* roomFlow(room: GameDataAccess.IRoom) {
  yield put<IAction>({
    namespace: "game",
    type: ActionType.Connected,
    payload: {
      sessionId: room.sessionId,
      roomId: room.id,
    },
  });
  const roomChan = createRoomChan(room);
  yield takeEvery(roomChan, watchRoomChan);
  yield takeEvery(ActionType.Leave, watchLeave, room);
}

function* watchLefted() {
  yield put<IAction>({
    namespace: "game",
    type: ActionType.Disconnected,
  });
}

export function* saga({ profile }: { profile: IProfile }) {
  yield takeEvery(ActionType.Connected, watchConnected);
  yield takeEvery(ActionType.Disconnected, watchDisconnected);
  yield takeEvery(ActionType.ReconnectFailed, watchReconnectFailed);
  yield takeEvery(ActionType.ReconnectSucceeded, watchReconnectSucceeded);
  yield takeEvery(ActionType.Reconnect, watchReconnect);
  yield takeEvery(ActionType.Lefted, watchLefted);
  yield takeEvery(ActionType.Create, watchCreate);

  yield put<IAction>({
    namespace: "game",
    type: ActionType.Reconnect,
  });
}
