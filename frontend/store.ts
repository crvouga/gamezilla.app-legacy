import { composeWithDevTools } from "@redux-devtools/extension";
import { applyMiddleware, createStore } from "redux";
import createSagaMiddleware from "redux-saga";
import { put, takeEvery } from "redux-saga/effects";
import { App, AppDataAccess } from "./app";
import { Action, isActions } from "./utils";

const sagaMiddleware = createSagaMiddleware();

const safeReducer = (
  maybeState: App.IState | undefined,
  action: App.IAction
) => {
  const state = maybeState ?? App.initialState;

  if (App.isAction(action)) {
    return App.reducer(state, action);
  }

  return state;
};

export const store = createStore(
  safeReducer,
  App.initialState,
  composeWithDevTools(applyMiddleware(sagaMiddleware))
);

type IWarning = {
  type: "unknown-action";
  action: unknown;
};

const actions = {
  warning: Action<"runtime", "warning", IWarning>("runtime", "warning"),
};

const isAction = (action: unknown) => {
  return isActions(actions, action) || App.isAction(action);
};

function* saga() {
  yield takeEvery("*", function* (action) {
    if (!isAction(action)) {
      yield put(
        actions.warning({
          type: "unknown-action",
          action,
        })
      );
    }
  });

  yield* App.saga(AppDataAccess);
}

sagaMiddleware.run(saga);
