import { Action, combineReducers, configureStore } from "@reduxjs/toolkit";
import { IGameState, game, gameSaga } from "./features/game/game-state";
import createSagaMiddleware from "redux-saga";
import { spawn } from "redux-saga/effects";

export type IAppState = {
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

export function* appSaga() {
  yield spawn(gameSaga);
}

export const app = {
  reducer,
  initialState,
};
