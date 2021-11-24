import { combineReducers } from "@reduxjs/toolkit";
import { spawn } from "redux-saga/effects";
import { auth, authSaga } from "./auth";
import { profile, profileSaga } from "./profile";

export const actions = {
  [auth.name]: auth.actions,
  [profile.name]: profile.actions,
};

export const selectors = {
  [auth.name]: auth.selectors,
  [profile.name]: profile.selectors,
};

export const reducer = combineReducers({
  [profile.name]: profile.reducer,
  [auth.name]: auth.reducer,
});

type IParameters = Parameters<typeof authSaga>[0] &
  Parameters<typeof profileSaga>[0];

export function* saga(dependencies: IParameters) {
  yield spawn(authSaga, dependencies);
  yield spawn(profileSaga, dependencies);
}
