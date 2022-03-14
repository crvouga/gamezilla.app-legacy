import { channel, Channel, eventChannel } from "redux-saga";
import { put, spawn, takeEvery } from "redux-saga/effects";
import * as Game from "./features/game/game-state";

export type IState = {
  game: Game.IState;
};

export type IAction = {
  type: "game";
  payload: Game.IAction;
};

export const reducer = (state: IState, action: IAction): IState => {
  switch (action.type) {
    case "game":
      return {
        game: Game.reducer(state.game, action.payload),
      };

    default:
      return state;
  }
};

export function* saga(actionChannel: Channel<IAction>) {
  const gameActionChannel = channel<Game.IAction>();

  yield takeEvery(gameActionChannel, function* (gameAction) {
    yield put(actionChannel, { type: "game", payload: gameAction });
  });

  yield spawn(Game.saga, gameActionChannel);

  actionChannel.take((action) => {
    if (action.type === "game") {
      gameActionChannel.put(action.payload);
    }
  });
}
