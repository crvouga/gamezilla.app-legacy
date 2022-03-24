import { call, takeLeading } from "redux-saga/effects";
import { Action, InferActionUnion } from "../../../utils";

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
      type: "signing-in";
      method: ISignInMethod;
    };

export type ISignInMethod = {
  type: "google";
};

export const initialState: IState = {
  type: "idle",
};

/**
 *
 *
 * Reducer
 *
 *
 */

export const actions = {
  signIn: Action<"auth/signIn", "signIn", ISignInMethod>(
    "auth/signIn",
    "signIn"
  ),
};

export type IAction = InferActionUnion<typeof actions>;

export const reducer = (state: IState, action: IAction): IState => {
  if (action.type === "auth/signIn/signIn") {
    return {
      type: "signing-in",
      method: action.payload,
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
  signIn: (method: ISignInMethod) => Promise<void>;
};

export function* saga({ signIn }: IDataAccess) {
  yield takeLeading(actions.signIn, function* (action) {
    yield call(signIn, action.payload);
  });
}
