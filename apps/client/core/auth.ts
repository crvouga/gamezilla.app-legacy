import { createAction, createReducer } from "@reduxjs/toolkit";
import { eventChannel } from "redux-saga";
import { call, put, takeLatest } from "redux-saga/effects";

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

export type IAuthServices = {
  signIn: ISignIn;
  signOut: ISignOut;
  onAuthState: IOnAuthState;
};

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

function* saga(services: IAuthServices) {
  const authStateChannel = eventChannel(services.onAuthState);

  yield takeLatest(authStateChannel, function* (authState) {
    yield put(actions.setState(authState));
  });

  yield takeLatest(actions.signIn, function* (action) {
    yield call(services.signIn, action.payload);
  });

  yield takeLatest(actions.signOut, function* () {
    yield call(services.signOut);
  });
}

export const auth = {
  name,
  selectors,
  actions,
  reducer,
  saga,
};
