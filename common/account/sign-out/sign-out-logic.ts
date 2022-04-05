import { createAction } from "@reduxjs/toolkit";
import { call, delay, takeLeading } from "redux-saga/effects";
import { InferActionUnion } from "../../utils/action-creator";

/**
 *
 *
 * State
 *
 *
 */

export type IState =
  | {
      type: "idle";
    }
  | {
      type: "signing-out";
    };

export const initialState: IState = {
  type: "idle",
};

/**
 *
 *
 * Actions
 *
 *
 */

export const actions = {
  signOut: createAction("auth/SIGN_OUT"),
};

export type IAction = InferActionUnion<typeof actions>;

/**
 *
 *
 * Reducer
 *
 *
 */

export const reducer = (state: IState, action: IAction): IState => {
  if (action.type === "auth/SIGN_OUT") {
    return {
      type: "signing-out",
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
  signOut: () => Promise<void>;
};

export function* saga({ signOut }: IDataAccess) {
  yield takeLeading(actions.signOut, function* () {
    yield delay(1000);
    yield call(signOut);
  });
}
