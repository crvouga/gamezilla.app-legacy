import { createAction, createReducer } from "@reduxjs/toolkit";
import { eventChannel } from "redux-saga";
import { call, put, takeEvery } from "redux-saga/effects";
import * as AccountDataAccess from "./account-data-access";

export type IState =
  | {
      type: "loading";
    }
  | {
      type: "logged-out";
    }
  | {
      type: "logged-in";
      userId: string;
      name?: string;
    };

export const actions = {
  login: createAction<{ method: "google" }, "account/login">("account/login"),
  loggedIn: createAction<
    { userId: string; name?: string },
    "account/logged-in"
  >("account/logged-in"),
  logout: createAction("account/logout"),
  loggedOut: createAction("account/logged-out"),
};

export const reducer = createReducer<IState>({ type: "loading" }, (builder) => {
  builder.addCase(actions.loggedIn, (_state, action) => {
    return {
      type: "logged-in",
      ...action.payload,
    };
  });

  builder.addCase(actions.loggedOut, () => {
    return {
      type: "logged-out",
    };
  });
});
/*



*/

export function* saga() {
  const accountChannel = eventChannel<
    ReturnType<typeof actions.loggedIn> | ReturnType<typeof actions.loggedOut>
  >((emit) => {
    const unsubscribe = AccountDataAccess.onAuthState((authState) => {
      if (authState.type === "logged-in") {
        emit(
          actions.loggedIn({
            userId: authState.userId,
            name: authState.userMetadata.name,
          })
        );
      }

      if (authState.type === "logged-out") {
        emit(actions.loggedOut());
      }
    });

    return () => {
      unsubscribe();
    };
  });

  yield takeEvery(accountChannel, function* (action) {
    yield put(action);
  });

  yield takeEvery(actions.logout, function* () {
    yield call(AccountDataAccess.logout);
  });

  yield takeEvery(actions.login, function* (action) {
    yield call(AccountDataAccess.login, { provider: action.payload.method });
  });
}
