import { configureStore, combineReducers } from "@reduxjs/toolkit";
import createSagaMiddleware from "redux-saga";
import { spawn } from "redux-saga/effects";
import { auth } from "./auth/auth";
import { ticTacToe } from "./game/tic-tac-toe";
import { profile } from "./profile/profile";

const sagaMiddleware = createSagaMiddleware();

export const store = configureStore({
  reducer: combineReducers({
    [ticTacToe.namespace]: ticTacToe.reducer,
    [auth.namespace]: auth.reducer,
    [profile.namespace]: profile.reducer,
  }),
  middleware: [sagaMiddleware],
});

sagaMiddleware.run(function* rootSaga() {
  yield spawn(ticTacToe.saga);
  yield spawn(auth.saga);
  yield spawn(profile.saga);
});
