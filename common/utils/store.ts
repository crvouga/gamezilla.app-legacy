import { Action, configureStore } from "@reduxjs/toolkit";
import createSagaMiddleware from "redux-saga";
import { spawn } from "redux-saga/effects";
import { logUnknownActionsSaga } from "./sagas";

export const createStore = <
  TState,
  TAction extends Action,
  TGenerator extends Generator
>({
  reducer,
  initialState,
  saga,
  isAction,
}: {
  reducer: (state: TState, action: TAction) => TState;
  initialState: TState;
  isAction: (action: Action<unknown>) => action is TAction;
  saga: () => TGenerator;
}) => {
  const rootReducer = (maybeState: TState | undefined, action: TAction) => {
    const state = maybeState ?? initialState;

    if (isAction(action)) {
      return reducer(state, action);
    }

    return state;
  };

  function* rootSaga() {
    yield spawn(logUnknownActionsSaga, { isAction });
    yield spawn(saga);
  }

  const sagaMiddleware = createSagaMiddleware();

  const store = configureStore({
    reducer: rootReducer,
    middleware: [sagaMiddleware],
  });

  sagaMiddleware.run(rootSaga);

  return store;
};
