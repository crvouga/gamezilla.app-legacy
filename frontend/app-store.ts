import { Action, combineReducers, configureStore } from "@reduxjs/toolkit";
import { IGameState, game, gameSaga } from "./features/game/game-state";
import createSagaMiddleware from "redux-saga";
import { spawn } from "redux-saga/effects";

type IAppState = {
  [game.namespace]: IGameState;
};

const initialState: IAppState = {
  game: game.initialState,
};

const reducer = (state: IAppState, action: Action): IAppState => {
  return {
    game: game.reducer(state.game, action),
  };
};

const sagaMiddleware = createSagaMiddleware();

export const appStore = configureStore({
  reducer: (state = initialState, action: Action) => {
    return reducer(state, action);
  },
  middleware: [sagaMiddleware],
});

function* saga() {
  yield spawn(gameSaga);
}

sagaMiddleware.run(saga);
