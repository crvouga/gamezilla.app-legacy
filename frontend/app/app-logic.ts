import { fork, takeLatest } from "redux-saga/effects";
import * as Auth from "../features/auth/auth-logic";
import * as Profile from "../features/profile/profile-logic";
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
 * Reducer
 *
 *
 */

export const actions = {
  ...Auth.actions,
  ...Profile.actions,
};

export type IAction = InferActionUnion<typeof actions>;

export const reducer = (state: IState, action: IAction): IState => {
  if (
    action.namespace === "auth/subscribe" ||
    action.namespace === "auth/signIn" ||
    action.namespace === "auth/signOut"
  ) {
    return {
      ...state,
      auth: Auth.reducer(state.auth, action),
    };
  }

  if (
    action.namespace === "profile/subscribe" ||
    action.namespace === "profile/create" ||
    action.namespace === "profile/update" ||
    action.namespace === "profile/delete"
  ) {
    return {
      ...state,
      profile: Profile.reducer(state.profile, action),
    };
  }

  return state;
};

/**
 *
 *
 * Saga
 *
 *
 */

export type IDataAccess = {
  auth: Auth.IDataAccess;
  profile: Profile.IDataAccess;
};

export function* saga({ auth, profile }: IDataAccess) {
  yield fork(Auth.saga, auth);

  yield takeLatest(actions.signedIn, function* (action) {
    const userId = action.payload.userId;

    yield* Profile.saga(profile, { userId });
  });
}
