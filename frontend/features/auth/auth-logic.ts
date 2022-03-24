import { fork } from "redux-saga/effects";
import { InferActionUnion } from "../../utils";
import * as SignIn from "./sign-in/sign-in-logic";
import * as SignOut from "./sign-out/sign-out-logic";
import * as Subscribe from "./subscribe/subscribe-logic";

/**
 *
 *
 * State
 *
 *
 */

export type IState = {
  signIn: SignIn.IState;
  signOut: SignOut.IState;
  subscribe: Subscribe.IState;
};

export const initialState: IState = {
  signIn: SignIn.initialState,
  signOut: SignOut.initialState,
  subscribe: Subscribe.initialState,
};

/**
 *
 *
 * Reducer
 *
 *
 */

export const actions = {
  ...SignIn.actions,
  ...SignOut.actions,
  ...Subscribe.actions,
};

export type IAction = InferActionUnion<typeof actions>;

export const reducer = (state: IState, action: IAction): IState => {
  if (action.namespace === "auth/subscribe") {
    return {
      ...state,
      subscribe: Subscribe.reducer(state.subscribe, action),
    };
  }

  if (action.namespace === "auth/signIn") {
    return {
      ...state,
      signIn: SignIn.reducer(state.signIn, action),
    };
  }

  if (action.namespace === "auth/signOut") {
    return {
      ...state,
      signOut: SignOut.reducer(state.signOut, action),
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
  signIn: SignIn.IDataAccess;
  signOut: SignOut.IDataAccess;
  subscribe: Subscribe.IDataAccess;
};

export function* saga(dataAccess: IDataAccess) {
  yield fork(SignIn.saga, dataAccess.signIn);
  yield fork(SignOut.saga, dataAccess.signOut);
  yield fork(Subscribe.saga, dataAccess.subscribe);
}
