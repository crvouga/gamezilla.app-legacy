import { configureStore, combineReducers } from "@reduxjs/toolkit";
import createSagaMiddleware from "redux-saga";
import { spawn } from "redux-saga/effects";
import { auth } from "./auth/auth";
import { ticTacToe } from "./game/tic-tac-toe";

const sagaMiddleware = createSagaMiddleware();

export const store = configureStore({
  reducer: combineReducers({
    [ticTacToe.namespace]: ticTacToe.reducer,
    [auth.namespace]: auth.reducer,
  }),
  middleware: [sagaMiddleware],
});

function* rootSaga() {
  yield spawn(ticTacToe.saga);
  yield spawn(auth.saga);
}

sagaMiddleware.run(rootSaga);
