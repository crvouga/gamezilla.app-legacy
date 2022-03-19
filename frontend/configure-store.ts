import { composeWithDevTools } from "@redux-devtools/extension";
import { Action, applyMiddleware, createStore } from "redux";
import createSagaMiddleware from "redux-saga";
import { ForkEffect, spawn } from "redux-saga/effects";
import { logUnknownActionsSaga } from "./utils";

export const configureStore = <TState, TAction extends Action<any>>({
  reducer,
  initialState,
  saga,
  isAction,
}: {
  reducer: (state: TState, action: TAction) => TState;
  initialState: TState;
  isAction: (action: unknown) => action is TAction;
  saga: () => Generator<ForkEffect<void>, void, undefined>;
}) => {
  const sagaMiddleware = createSagaMiddleware();

  const store = createStore(
    (maybeState: TState | undefined, action: TAction) => {
      const state = maybeState ?? initialState;

      if (isAction(action)) {
        return reducer(state, action);
      }

      return state;
    },
    undefined,
    composeWithDevTools(applyMiddleware(sagaMiddleware))
  );

  sagaMiddleware.run(function* () {
    yield spawn(logUnknownActionsSaga, { isAction });
    yield spawn(saga);
  });

  return store;
};
