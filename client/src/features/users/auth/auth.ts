import { createAction, createReducer } from "@reduxjs/toolkit";
import { eventChannel } from "redux-saga";
import { call, put, takeEvery } from "redux-saga/effects";
import {
  ISignInMethod,
  onAuthEvents,
  signIn,
  signOut,
} from "./auth-data-access";

const namespace: "auth" = "auth";

const actions = {
  signIn: createAction<ISignInMethod>(`${namespace}/SIGN_IN`),
  signedIn: createAction<{
    id: string;
  }>(`${namespace}/SIGNED_IN`),
  signOut: createAction(`${namespace}/SIGN_OUT`),
  signedOut: createAction(`${namespace}/SIGNED_OUT`),
};

type IState = {
  type: "signed-in";
  userId: string;
} | {
  type: "signed-out";
} | {
  type: "loading";
};

const selectors = {
  slice: (state: { [namespace]: IState }): IState => state[namespace],
};

const reducer = createReducer<IState>({ type: "loading" }, (builder) => {
  builder.addCase(actions.signedIn, (_state, action) => {
    return {
      type: "signed-in",
      userId: action.payload.id,
    };
  });

  builder.addCase(actions.signedOut, () => {
    return {
      type: "signed-out",
    };
  });
});

function* saga() {
  yield takeEvery(eventChannel(onAuthEvents), function* (authEvent) {
    yield put(authEvent);
  });

  yield takeEvery(actions.signIn, function* (action) {
    yield call(signIn, action.payload);
  });

  yield takeEvery(actions.signOut, function* () {
    yield call(signOut);
  });
}

export const auth = {
  namespace,
  reducer,
  actions,
  selectors,
  saga,
};
