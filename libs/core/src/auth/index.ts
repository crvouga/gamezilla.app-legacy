import { createReducer } from "@reduxjs/toolkit";
import { createAction } from "@gamezilla/utility";
import { eventChannel } from "redux-saga";
import { call, put, takeLatest } from "redux-saga/effects";

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
  signIn: createAction<ISignInMethod>(name, "sign-in"),
  signOut: createAction(name, "sign-out"),
  //
  signedIn: createAction<{ userId: string }>(name, "signed-in"),
  //
  setState: createAction<IAuthState>(name, "set-state"),
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
