import { createAction, createReducer } from "@reduxjs/toolkit";

const name: "auth" = "auth";

type ISignInMethod = {
  type: "google";
};

type IState =
  | {
      type: "signed-in";
    }
  | {
      type: "signed-out";
    }
  | {
      type: "loading";
    };

const actions = {
  signIn: createAction<ISignInMethod>("auth/signIn"),
  setState: createAction<IState>("auth/setState"),
};

const selectors = {
  [name]: (state: { [name]: IState }): IState => state[name],
};

const reducer = createReducer<IState>(
  {
    type: "loading",
  },
  {
    [actions.setState.toString()]: (
      _state,
      action: ReturnType<typeof actions.setState>
    ) => {
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
