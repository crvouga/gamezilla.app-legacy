import { EventChannel } from "redux-saga";
import { put, takeEvery } from "redux-saga/effects";
import { Action, InferActionUnion } from "../../../utils";

/**
 *
 *
 * State
 *
 *
 */

export type ISignedOutState = {
  type: "signed-out";
};

export type ISignedInState = {
  type: "signed-in";
  userId: string;
  defaultName: string;
};

export type ILoadingState = {
  type: "loading";
};

export type IState = ISignedOutState | ISignedInState | ILoadingState;

/**
 *
 *
 * Reducer
 *
 *
 */

export const actions = {
  signedIn: Action<
    "auth/subscribe",
    "signed-in",
    { userId: string; defaultName: string }
  >("auth/subscribe", "signed-in"),
  signedOut: Action("auth/subscribe", "signed-out"),
};

export type IAction = InferActionUnion<typeof actions>;

export const reducer = (state: IState, action: IAction): IState => {
  if (action.type === "auth/subscribe/signed-in") {
    return {
      type: "signed-in",
      userId: action.payload.userId,
      defaultName: action.payload.defaultName,
    };
  }

  if (action.type === "auth/subscribe/signed-out") {
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

export function* saga({ authEventChan }: IDataAccess) {
  yield takeEvery(authEventChan, function* (authEvent) {
    yield put(authEvent);
  });
}
