import { createAction, createReducer } from "@reduxjs/toolkit";

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

export const auth = {
  name,
  selectors,
  actions,
  reducer,
};
