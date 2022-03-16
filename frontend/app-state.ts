import { combineReducers } from "@reduxjs/toolkit";
import { fork, spawn, takeLatest } from "redux-saga/effects";
import * as Account from "./features/account/account-state";
import * as Game from "./features/game/game-state";
import * as Profile from "./features/profile/profile-state";

export const reducer = combineReducers({
  game: Game.reducer,
  account: Account.reducer,
  profile: Profile.reducer,
});

export function* saga() {
  yield spawn(Account.saga);

  yield takeLatest(Account.actions.loggedIn, function* (action) {
    yield fork(Profile.saga, { userId: action.payload.userId });
  });

  yield takeLatest(Profile.actions.found, function* (action) {
    yield fork(Game.saga, { profile: action.payload.profile });
  });
}
