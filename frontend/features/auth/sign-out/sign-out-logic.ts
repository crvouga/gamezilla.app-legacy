import { call, delay, takeLeading } from "redux-saga/effects";
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
      type: "signing-out";
    };

/**
 *
 *
 * Reducer
 *
 *
 */

export const actions = {
  signOut: Action<"signOut", "signOut">("signOut", "signOut"),
};

export type IAction = InferActionUnion<typeof actions>;

export const reducer = (state: IState, action: IAction): IState => {
  if (action.type === "signOut::signOut") {
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
