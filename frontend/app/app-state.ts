import { fork, spawn, takeLatest } from "redux-saga/effects";
import * as Auth from "../features/account/auth-state/auth-state";
import { dataAccess as authDataAccess } from "../features/account/auth-state/auth-state-data-access";
import * as Profile from "../features/account/profile-state/profile-state";
import * as Game from "../features/game/game-state";
import { dataAccess as profileDataAccess } from "../features/account/profile-state/profile-state-data-access";
import { InferActionUnion } from "../utils";

/**
 *
 *
 * State
 *
 *
 */

export type IState = {
  auth: Auth.IState;
  profile: Profile.IState;
  game: Game.IState;
};

/**
 *
 *
 * Actions
 *
 *
 */

export const actions = {
  ...Auth.actions,
  ...Profile.actions,
  ...Game.actions,
};

export type IAction = InferActionUnion<typeof actions>;

/**
 *
 *
 * Reducer
 *
 *
 */

export const reducer = (state: IState, action: IAction): IState => {
  switch (action.type) {
    case "auth/SIGNED_IN":
    case "auth/SIGNED_OUT":
      return {
        ...state,
        auth: Auth.reducer(state.auth, action),
      };

    case "game/CLOSE":
    case "game/OPEN":
      return {
        ...state,
        game: Game.reducer(state.game, action),
      };

    case "profile/FOUND":
    case "profile/NOT_FOUND":
      return {
        ...state,
        profile: Profile.reducer(state.profile, action),
      };
  }
};

/**
 *
 *
 * Saga
 *
 *
 */

export function* saga() {
  yield spawn(Auth.saga, { dataAccess: authDataAccess });

  yield takeLatest(Auth.actions.signedIn, function* (action) {
    const { userId } = action.payload;

    yield fork(Profile.saga, {
      dataAccess: profileDataAccess,
      userId,
    });
  });
}
