import { createAction, createReducer } from "@reduxjs/toolkit";
import { call, takeLatest } from "redux-saga/effects";
import { auth } from "../auth/auth";
import { fetchElseCreateProfile } from "./profile-data-access";

const namespace: "profile" = "profile";

export type IProfile = {
  userId: string;
  avatarUrl?: string;
  displayName?: string;
};

const actions = {
  sync: createAction<IProfile>(`${namespace}/SYNC`),
};

const reducer = createReducer<IProfile | null>(null, (builder) => {
  builder.addCase(actions.sync, (_state, action) => {
    return action.payload;
  });
});

const selectors = {
  slice: (state: { [namespace]: IProfile | null }): IProfile | null =>
    state[namespace],
};

function* saga() {
  yield takeLatest(auth.actions.signedIn, function* (action) {
    const userId = action.payload.id;

    yield call(fetchElseCreateProfile, { userId });
  });
}

export const profile = {
  namespace,
  actions,
  saga,
  reducer,
  selectors,
};
