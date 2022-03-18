import { composeWithDevTools } from "@redux-devtools/extension";
import { TypedUseSelectorHook, useDispatch, useSelector } from "react-redux";
import { applyMiddleware, createStore } from "redux";
import createSagaMiddleware from "redux-saga";
import { put, takeEvery } from "redux-saga/effects";
import * as App from "./app";
import { login } from "./app-data-access";
import { onAuthState } from "./features/account/account-data-access";
import { onProfile } from "./features/profile/profile-data-access";
import { Action, isActions } from "./utils";

const sagaMiddleware = createSagaMiddleware();

export const appStore = createStore(
  (maybeState: App.IState | undefined, action: App.IAction) => {
    const state = maybeState ?? App.initialState;

    if (App.isAction(action)) {
      return App.reducer(state, action);
    }

    return state;
  },
  App.initialState,
  composeWithDevTools(applyMiddleware(sagaMiddleware))
);

const params: App.ISagaParams = {
  subscribeAuthState: onAuthState,
  appLoggedOut: {
    login: ({ method }) => login({ provider: method }),
  },
  appLoggedIn: {
    subscribeProfile: onProfile,
  },
};

type IWarning = {
  type: "unknown-action";
  action: unknown;
};

const Actions = {
  warning: Action<"runtime", "warning", IWarning>("runtime", "warning"),
};

const isAction = (action: unknown) => {
  return isActions(Actions, action) || App.isAction(action);
};

function* saga() {
  yield takeEvery("*", function* (action) {
    if (!isAction(action)) {
      yield put(
        Actions.warning({
          type: "unknown-action",
          action,
        })
      );
    }
  });

  yield* App.saga(params);
}

sagaMiddleware.run(saga);

/*


*/

export type IAppState = ReturnType<typeof appStore.getState>;
export type IAppDispatch = typeof appStore.dispatch;

export const useAppDispatch = () => useDispatch<IAppDispatch>();
export const useAppSelector: TypedUseSelectorHook<IAppState> = useSelector;
