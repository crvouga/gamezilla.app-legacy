import { composeWithDevTools } from "@redux-devtools/extension";
import * as ReactDOM from "react-dom";
import { Action, applyMiddleware, createStore } from "redux";
import createSagaMiddleware from "redux-saga";
import { ForkEffect, spawn } from "redux-saga/effects";
import { logUnknownActionsSaga } from "./utils";

export const runApp = <TState, TAction extends Action<any>>({
  reducer,
  initialState,
  view,
  saga,
  isAction,
  container,
}: {
  container: HTMLElement;
  view: (props: {
    state: TState;
    dispatch: (action: TAction) => void;
  }) => JSX.Element;
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

  const element = document.createElement("div");

  container.appendChild(element);

  store.subscribe(() => {
    ReactDOM.render(
      view({
        state: store.getState(),
        dispatch: store.dispatch,
      }),
      element
    );
  });

  sagaMiddleware.run(function* () {
    yield spawn(logUnknownActionsSaga, { isAction });
    yield spawn(saga);
  });
};
