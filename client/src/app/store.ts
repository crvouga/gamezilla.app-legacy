import { combineReducers, configureStore } from "@reduxjs/toolkit";
import createSagaMiddleware from "redux-saga";
import { spawn } from "redux-saga/effects";
import { auth, game, profile } from "src/features";

const sagaMiddleware = createSagaMiddleware();

export const store = configureStore({
  reducer: combineReducers({
    [auth.namespace]: auth.reducer,
    [profile.namespace]: profile.reducer,
  }),
  middleware: [sagaMiddleware],
});

sagaMiddleware.run(function* rootSaga() {
  yield spawn(game.saga);
  yield spawn(auth.saga);
  yield spawn(profile.saga);
});

export type AppState = ReturnType<typeof store.getState>;

export type AppDispatch = typeof store.dispatch;
