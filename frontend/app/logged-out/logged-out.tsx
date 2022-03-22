import React from "react";
import { call, takeLeading } from "redux-saga/effects";
import {
  Action,
  InferActionMap,
  InferActionUnion,
  isActions,
} from "../../utils";

/* 


*/

export type IState =
  | {
      type: "idle";
    }
  | {
      type: "loading";
    };

export const initialState: IState = {
  type: "idle",
};

export type ILoginMethod = {
  type: "google";
};

/* 


*/

const actions = {
  login: Action<"logged-out", "login", ILoginMethod>("logged-out", "login"),
};

export type IAction = InferActionUnion<typeof actions>;

export type IActionMap = InferActionMap<typeof actions>;

export const isAction = (action: unknown): action is IAction => {
  return isActions(actions, action);
};

export const reducer = (state: IState, action: IAction): IState => {
  switch (action.type) {
    case "logged-out::login":
      return {
        type: "loading",
      };
  }
};

/* 


*/

export type ILogin = (method: ILoginMethod) => void;

export type IDataAccess = {
  login: ILogin;
};

export function* saga({ login }: IDataAccess) {
  function* loginFlow(action: IActionMap["login"]) {
    yield call(login, action.payload);
  }

  yield takeLeading(actions.login, loginFlow);
}

/* 


*/

export const view = ({
  state,
  dispatch,
}: {
  state: IState;
  dispatch: (action: IAction) => void;
}) => {
  const onLogin = () => {
    dispatch(actions.login({ type: "google" }));
  };

  return (
    <div>
      <h1>Gamezilla</h1>

      <button>Continue with Google</button>
    </div>
  );
};
