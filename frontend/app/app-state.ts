import { fork, spawn, takeLatest } from "redux-saga/effects";
import * as Auth from "../features/auth/auth-state/auth-state";
import * as Profile from "../features/profile/profile-state/profile-state";
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
  if (action.type === "auth/SIGNED_IN" || action.type === "auth/SIGNED_OUT") {
    return {
      ...state,
      auth: Auth.reducer(state.auth, action),
    };
  }

  return {
    ...state,
    profile: Profile.reducer(state.profile, action),
  };
};

/**
 *
 *
 * Saga
 *
 *
 */

export function* saga() {
  yield spawn(Auth.saga);

  yield takeLatest(actions.signedIn, function* (action) {
    yield* Profile.saga({ userId: action.payload.userId });
  });
}
