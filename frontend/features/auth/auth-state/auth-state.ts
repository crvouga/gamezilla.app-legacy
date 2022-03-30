import { createAction } from "@reduxjs/toolkit";
import { EventChannel } from "redux-saga";
import { put, takeEvery } from "redux-saga/effects";
import { InferActionUnion } from "../../../utils";
import { dataAccess } from "./auth-state-data-access";

/**
 *
 *
 * State
 *
 *
 */

export type IState =
  | {
      type: "loading";
    }
  | {
      type: "signed-out";
    }
  | {
      type: "signed-in";
      userId: string;
      defaultName: string;
    };

/**
 *
 *
 * Actions
 *
 *
 */

export const actions = {
  signedIn: createAction<
    { userId: string; defaultName: string },
    "auth/SIGNED_IN"
  >("auth/SIGNED_IN"),

  signedOut: createAction("auth/SIGNED_OUT"),
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
  if (action.type === "auth/SIGNED_IN") {
    return {
      type: "signed-in",
      userId: action.payload.userId,
      defaultName: action.payload.defaultName,
    };
  }

  if (action.type === "auth/SIGNED_OUT") {
    return {
      type: "signed-out",
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
  authEventChan: EventChannel<IAction>;
};

export function* saga() {
  yield takeEvery(dataAccess.authEventChan, function* (authEvent) {
    yield put(authEvent);
  });
}
