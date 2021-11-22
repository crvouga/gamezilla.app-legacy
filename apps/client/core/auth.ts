import { createAction, createReducer } from "@reduxjs/toolkit";
import { eventChannel } from "redux-saga";
import { take, fork, call, put, takeLatest } from "redux-saga/effects";
import { IOnProfile } from "./profile/profile";

const name: "auth" = "auth";

export type ISignInMethod = {
  type: "google";
};

export type IAuthState =
  | {
      type: "signed-in";
      userId: string;
    }
  | {
      type: "signed-out";
    }
  | {
      type: "loading";
    };

export type ISignIn = (method: ISignInMethod) => void;
export type ISignOut = () => void;
export type IOnAuthState = (set: (state: IAuthState) => void) => () => void;

const actions = {
  signIn: createAction<ISignInMethod>("auth/signIn"),
  signOut: createAction("auth/signOut"),
  //
  signedIn: createAction<{ userId: string }>("auth/signed-in"),
  //
  setState: createAction<IAuthState>("auth/SET_STATE"),
};

const selectors = {
  state: (state: { [name]: IAuthState }): IAuthState => state[name],
};

const reducer = createReducer<IAuthState>(
  {
    type: "loading",
  },
  {
    [actions.setState.toString()]: (_, action) => {
      return action.payload;
    },
  }
);

export const auth = {
  name,
  selectors,
  actions,
  reducer,
};

export function* authSaga({
  signIn,
  signOut,
  onAuthState,
}: {
  signIn: ISignIn;
  signOut: ISignOut;
  onAuthState: IOnAuthState;
}) {
  const authStateChannel = eventChannel(onAuthState);

  yield takeLatest(authStateChannel, function* (authState) {
    yield put(actions.setState(authState));

    if (authState.type === "signed-in") {
      yield put(actions.signedIn(authState));
    }
  });

  yield takeLatest(actions.signIn, function* (action) {
    yield call(signIn, action.payload);
  });

  yield takeLatest(actions.signOut, function* () {
    yield call(signOut);
  });
}
