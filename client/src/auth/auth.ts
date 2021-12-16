import { createAction, createReducer } from "@reduxjs/toolkit";
import { ISignInMethod, signIn } from "./sign-in";
import { put, call, takeEvery } from "redux-saga/effects";
import { signOut } from "./sign-out";
import { onAuthEvents } from "./on-auth-events";

import { eventChannel } from "redux-saga";

const namespace: "auth" = "auth";

const actions = {
  signIn: createAction<ISignInMethod>(`${namespace}/SIGN_IN`),
  signedIn: createAction<{
    id: string;
    displayName?: string;
    avatarUrl?: string;
  }>(`${namespace}/SIGNED_IN`),
  signOut: createAction(`${namespace}/SIGN_OUT`),
  signedOut: createAction(`${namespace}/SIGNED_OUT`),
};

type IState =
  | ReturnType<typeof actions.signedOut>
  | ReturnType<typeof actions.signedIn>;

const selectors = {
  slice: (state: { [namespace]: IState }): IState => state[namespace],
};

const reducer = createReducer<IState>(actions.signedOut(), (builder) => {
  builder.addCase(actions.signedIn, (_state, action) => {
    return action;
  });

  builder.addCase(actions.signedOut, (_state, action) => {
    return action;
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
