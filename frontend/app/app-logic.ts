import { takeLatest, fork } from "redux-saga/effects";
import * as Auth from "../features/auth/auth-logic";
import * as SignIn from "../features/auth/sign-in/sign-in-logic";
import * as SignOut from "../features/auth/sign-out/sign-out-logic";
import * as Profile from "../features/profile/profile-logic";
import { InferActionUnion } from "../utils";

/**
 *
 *
 * State
 *
 *
 */

export type IProfileFoundState = Profile.IFoundState & {
  signOut: SignOut.IState;
};

export type ISignedInState = Auth.ISignedInState & {
  profile: IProfileFoundState | Profile.INotFoundState | Profile.ILoadingState;
};

export type ISignedOutState = Auth.ISignedOutState & { signIn: SignIn.IState };

export type IState = Auth.ILoadingState | ISignedOutState | ISignedInState;

/**
 *
 *
 * Reducer
 *
 *
 */

export const actions = {
  ...SignOut.actions,
  ...SignIn.actions,
  ...Auth.actions,
  ...Profile.actions,
};

export type IAction = InferActionUnion<typeof actions>;

const authReducer = (state: IState, action: Auth.IAction): IState => {
  const reduced = Auth.reducer(state, action);

  if (reduced.type === "signed-in") {
    return {
      type: "signed-in",
      userId: reduced.userId,
      defaultName: reduced.defaultName,
      profile: {
        type: "loading",
      },
    };
  }

  if (reduced.type === "signed-out") {
    return {
      type: "signed-out",
      signIn: {
        type: "idle",
      },
    };
  }

  return {
    type: "loading",
  };
};

export const reducer = (state: IState, action: IAction): IState => {
  if (action.namespace === "auth") {
    return authReducer(state, action);
  }

  if (state.type === "signed-out" && action.namespace === "signIn") {
    return {
      ...state,
      signIn: SignIn.reducer(state.signIn, action),
    };
  }

  if (
    state.type === "signed-in" &&
    state.profile.type === "found" &&
    action.namespace === "signOut"
  ) {
    return {
      ...state,
      profile: {
        ...state.profile,
        signOut: SignOut.reducer(state.profile.signOut, action),
      },
    };
  }

  if (state.type === "signed-in" && action.namespace === "profile") {
    const reduced = Profile.reducer(state.profile, action);
    if (reduced.type === "found") {
      return {
        ...state,
        profile: {
          ...reduced,
          signOut: {
            type: "idle",
          },
        },
      };
    }

    if (reduced.type === "loading") {
      return {
        ...state,
        profile: reduced,
      };
    }

    if (reduced.type === "not-found") {
      return {
        ...state,
        profile: reduced,
      };
    }
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
  signIn: SignIn.IDataAccess;
  signOut: SignOut.IDataAccess;
  profile: Profile.IDataAccess;
};

export function* saga({ auth, signIn, signOut, profile }: IDataAccess) {
  yield fork(Auth.saga, auth);

  yield fork(SignIn.saga, signIn);

  yield fork(SignOut.saga, signOut);

  yield takeLatest(actions.synced, function* (action) {
    if (action.payload.type === "signed-in") {
      const userId = action.payload.userId;
      yield* Profile.saga(profile, { userId });
    }
  });
}
