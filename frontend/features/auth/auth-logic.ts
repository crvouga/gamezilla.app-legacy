import { EventChannel } from "redux-saga";
import { put, takeEvery } from "redux-saga/effects";
import { Action, InferActionUnion } from "../../utils";

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

export type IAuthState = ISignedOutState | ISignedInState;

export type IState = IAuthState | ILoadingState;

/**
 *
 *
 * Reducer
 *
 *
 */

export const actions = {
  synced: Action<"auth", "synced", IAuthState>("auth", "synced"),
};

export type IAction = InferActionUnion<typeof actions>;

export const reducer = (state: IState, action: IAction): IState => {
  if (action.type === "auth::synced") {
    return {
      ...state,
      ...action.payload,
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
  authStateChan: EventChannel<IAuthState>;
  getAuthState: () => IAuthState;
};

export function* saga({ authStateChan }: IDataAccess) {
  yield takeEvery(authStateChan, function* (authState) {
    yield put(actions.synced(authState));
  });
}
