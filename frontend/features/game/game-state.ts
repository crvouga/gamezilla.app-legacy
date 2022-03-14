import { Channel, EventChannel } from "redux-saga";

import { fork, takeEvery, call, put } from "typed-redux-saga";
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

export type IAction =
  | {
      type: "connected";
    }
  | {
      type: "disconnected";
    }
  | {
      type: "reconnect";
      sessionId: string;
      roomId: string;
    }
  | {
      type: "reconnect/failed";
    }
  | {
      type: "reconnect/succeeded";
    }
  | {
      type: "create";
    }
  | {
      type: "join";
    };

export const reducer = (state: IState, action: IAction): IState => {
  switch (action.type) {
    case "connected":
      return {
        type: "connected",
      };

    case "reconnect/succeeded":
      return {
        type: "connected",
      };

    case "reconnect/failed":
      return {
        type: "disconnected",
      };

    case "disconnected":
      return {
        type: "disconnected",
      };

    default:
      return state;
  }
};

/*



*/

export function* saga(actionChannel: Channel<IAction>) {
  const storage =
    createStorageLocalJSON<{ roomId: string; sessionId: string }>();

  const found = storage.read("gameRoomIds");

  if (found) {
    yield put(actionChannel, { type: "reconnect", ...found });
  } else {
    yield put(actionChannel, { type: "disconnected" });
  }

  console.log("TAKE");
  actionChannel.take(console.log);

  yield* takeEvery(actionChannel, function* (action) {
    console.log(action);

    if (action.type === "reconnect") {
      const { roomId, sessionId } = action;

      const roomChannel = yield* call(() =>
        GameDataAccess.reconnect({ roomId, sessionId })
      );

      if (roomChannel) {
        yield fork(connectedSaga, roomChannel);
      }

      return;
    }

    if (action.type === "create") {
      const roomChannel = yield* call(() => GameDataAccess.create());

      if (roomChannel) {
        yield fork(connectedSaga, roomChannel);
      }

      return;
    }
  });
}

function* connectedSaga(roomChannel: EventChannel<GameDataAccess.IRoomAction>) {
  yield put<IAction>({
    type: "connected",
  });

  yield takeEvery(roomChannel, function* (action) {
    console.log(action);
  });
}
