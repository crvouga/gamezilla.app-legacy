import { EventChannel } from "redux-saga";
import { ActionPattern } from "redux-saga/effects";
import { call, fork, put, takeEvery } from "typed-redux-saga";
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

type IGameReconnect = {
  namespace: "game";
  type: "game/reconnect";
  payload: {
    sessionId: string;
    roomId: string;
  };
};

export type IAction =
  | {
      namespace: "game";
      type: "game/connected";
    }
  | {
      namespace: "game";
      type: "game/disconnected";
    }
  | IGameReconnect
  | {
      namespace: "game";
      type: "game/reconnect/failed";
    }
  | {
      namespace: "game";
      type: "game/reconnect/succeeded";
    }
  | {
      namespace: "game";
      type: "game/create";
    }
  | {
      namespace: "game";
      type: "game/join";
    }
  | {
      namespace: "game";
      type: "game/leave";
    }
  | {
      namespace: "game";
      type: "game/lefted";
    }
  | {
      namespace: "game";
      type: "game/message";
      payload: {
        type: string;
      };
    };

export const reducer = (state: IState, action: IAction): IState => {
  switch (action.type) {
    case "game/connected":
      return {
        type: "connected",
      };

    case "game/reconnect/succeeded":
      return {
        type: "connected",
      };

    case "game/reconnect/failed":
      return {
        type: "disconnected",
      };

    case "game/disconnected":
      return {
        type: "disconnected",
      };

    case "game/lefted":
      return {
        type: "disconnected",
      };

    default:
      return state;
  }
};

/*



*/

export function* saga() {
  const storage =
    createStorageLocalJSON<{ roomId: string; sessionId: string }>();

  const found = storage.read("gameRoomIds");

  if (found) {
    yield put<IAction>({
      namespace: "game",
      type: "game/reconnect",
      payload: found,
    });
  } else {
    yield put<IAction>({
      namespace: "game",
      type: "game/disconnected",
    });
  }

  yield takeEvery("*", function* (action: IAction) {
    if (action.type === "game/reconnect") {
      const { roomId, sessionId } = action.payload;

      const result: Awaited<ReturnType<typeof GameDataAccess.reconnect>> =
        yield* call(GameDataAccess.reconnect, {
          roomId,
          sessionId,
        });

      if (result) {
        yield fork(connectedSaga, result);
      }
    }

    if (action.type === "game/create") {
      const result = yield* call(GameDataAccess.create);

      if (result) {
        yield fork(connectedSaga, result);
      }
    }
  });
}

function* connectedSaga({
  roomChannel,
  leave,
}: {
  roomChannel: EventChannel<GameDataAccess.IRoomAction>;
  leave: () => void;
}) {
  yield put<IAction>({
    namespace: "game",
    type: "game/connected",
  });

  yield* takeEvery("*", function* (action: IAction) {
    if (action.type === "game/leave") {
      yield* call(leave);
    }
  });

  yield* takeEvery(roomChannel, function* (action) {
    if (action.type === "room/lefted") {
      yield put<IAction>({ namespace: "game", type: "game/lefted" });
    }

    if (action.type === "room/message") {
      yield put<IAction>({
        namespace: "game",
        type: "game/message",
        payload: action.message,
      });
    }
  });
}
