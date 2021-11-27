import { combineReducers } from "@reduxjs/toolkit";
import { spawn } from "redux-saga/effects";
import { auth, authSaga } from "./auth";
import { game, gameSaga } from "./game";
import { profile, profileSaga } from "./profile";
import { toast, toastSaga } from "./toasts";

export const actions = {
  [game.name]: game.actions,
  [auth.name]: auth.actions,
  [profile.name]: profile.actions,
  [toast.name]: toast.actions,
};

export const selectors = {
  [game.name]: game.selectors,
  [auth.name]: auth.selectors,
  [profile.name]: profile.selectors,
  [toast.name]: toast.selectors,
};

export const reducer = combineReducers({
  [game.name]: game.reducer,
  [profile.name]: profile.reducer,
  [auth.name]: auth.reducer,
  [toast.name]: toast.reducer,
});

type IParameters = 
  Parameters<typeof authSaga>[0] &
  Parameters<typeof profileSaga>[0] &
  Parameters<typeof gameSaga>[0];

export function* saga(dependencies: IParameters) {
  yield spawn(authSaga, dependencies);
  yield spawn(profileSaga, dependencies);
  yield spawn(toastSaga);
  yield spawn(gameSaga, dependencies);
}
