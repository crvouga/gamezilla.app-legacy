import { Channel } from "redux-saga";
import { fork, spawn, takeEvery, takeLatest } from "redux-saga/effects";
import * as Game from "./features/game/game-state";
import * as Account from "./features/account/account-state";
import * as Profile from "./features/profile/profile-state";
import { combineReducers } from "redux";

export const reducer = combineReducers({
  game: Game.reducer,
  account: Account.reducer,
  profile: Profile.reducer,
});

export function* saga() {
  yield spawn(Game.saga);
  yield spawn(Account.saga);

  yield takeLatest(Account.actions.loggedIn, function* (action) {
    yield fork(Profile.saga, { userId: action.payload.userId });
  });
}
