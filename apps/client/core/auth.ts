import { createAction, createReducer } from "@reduxjs/toolkit";
import { eventChannel } from "redux-saga";
import { call, put, takeEvery } from "redux-saga/effects";

const name: "auth" = "auth";

export type ISignInMethod = {
  type: "google";
};

export type IAuthState =
  | {
      type: "signed-in";
      user: {
        userId: string;
        avatarUrl?: string;
        displayName?: string;
      };
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
  setState: createAction<IAuthState>("auth/setState"),
};

const selectors = {
  state: (state: { [name]: IAuthState }): IAuthState => state[name],
};

const reducer = createReducer<IAuthState>(
  {
    type: "loading",
  },
  {
    [actions.setState.toString()](
      _state,
      action: ReturnType<typeof actions.setState>
    ) {
      return action.payload;
    },
  }
);

export function* authSaga({
  onAuthState,
  signIn,
  signOut,
}: {
  onAuthState: IOnAuthState;
  signIn: ISignIn;
  signOut: ISignOut;
}) {
  const authStateChannel = eventChannel(onAuthState);

  yield takeEvery(authStateChannel, function* (authState) {
    yield put(actions.setState(authState));
  });

  yield takeEvery(actions.signIn, function* (action) {
    yield call(signIn, action.payload);
  });

  yield takeEvery(actions.signOut, function* () {
    yield call(signOut);
  });
}

export const auth = {
  name,
  selectors,
  actions,
  reducer,
};
