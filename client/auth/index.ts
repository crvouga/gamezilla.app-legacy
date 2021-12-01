import { createReducer } from "@reduxjs/toolkit";
import { createAction } from "@utility";
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

type ISyncAuthState =
  | {
      type: "signed-in";
      userId: string;
    }
  | {
      type: "signed-out";
    };

export type ISignIn = (method: ISignInMethod) => void;
export type ISignOut = () => void;
export type IOnAuthState = (set: (state: ISyncAuthState) => void) => () => void;

const actions = {
  signIn: createAction<ISignInMethod>(name, "sign-in"),
  signOut: createAction(name, "sign-out"),
  //
  signedIn: createAction<{ userId: string }>(name, "signed-in"),
  signedOut: createAction(name, "signed-out"),
  //
  setState: createAction<IAuthState>(name, "set-state"),
  sync: createAction<IAuthState>(name, "sync"),
};

const selectors = {
  state: (state: { [name]: IAuthState }): IAuthState => state[name],
};

const reducer = createReducer<IAuthState>(
  {
    type: "loading",
  },
  (builder) => {
    builder.addCase(actions.sync, (_state, action) => {
      return action.payload;
    });
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
  yield takeLatest(actions.signIn, function* (action) {
    yield call(signIn, action.payload);
  });

  yield takeLatest(actions.signOut, function* () {
    yield call(signOut);
  });

  const authStateChannel = eventChannel(onAuthState);

  yield takeLatest(authStateChannel, function* (authState) {
    yield put(actions.sync(authState));
  });

  yield takeLatest(actions.sync, function* (action) {
    const authState = action.payload;

    switch (authState.type) {
      case "signed-in":
        yield put(actions.signedIn(authState));
        break;

      case "signed-out":
        yield put(actions.signedOut());
        break;
    }
  });
}
