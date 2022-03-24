import { fork } from "redux-saga/effects";
import { InferActionUnion } from "../../utils";
import * as Create from "./create/create-logic";
import * as Delete from "./delete/delete-logic";
import * as Subscribe from "./subscribe/subscribe-logic";
import * as Update from "./update/update-logic";

/**
 *
 *
 * State
 *
 *
 */

export type IState = {
  create: Create.IState;
  delete: Delete.IState;
  subscribe: Subscribe.IState;
  update: Update.IState;
};

export const initialState: IState = {
  create: Create.initialState,
  delete: Delete.initialState,
  subscribe: Subscribe.initialState,
  update: Update.initialState,
};

/**
 *
 *
 * Reducer
 *
 *
 */

export const actions = {
  ...Create.actions,
  ...Delete.actions,
  ...Update.actions,
  ...Subscribe.actions,
};

export type IAction = InferActionUnion<typeof actions>;

export const reducer = (state: IState, action: IAction): IState => {
  if (action.namespace === "profile/create") {
    return {
      ...state,
      create: Create.reducer(state.create, action),
    };
  }

  if (action.namespace === "profile/delete") {
    return {
      ...state,
      delete: Delete.reducer(state.delete, action),
    };
  }

  if (action.namespace === "profile/update") {
    return {
      ...state,
      update: Update.reducer(state.update, action),
    };
  }

  if (action.namespace === "profile/subscribe") {
    return {
      ...state,
      subscribe: Subscribe.reducer(state.subscribe, action),
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
  create: Create.IDataAccess;
  delete: Delete.IDataAccess;
  update: Update.IDataAccess;
  subscribe: Subscribe.IDataAccess;
};

export function* saga(dataAccess: IDataAccess, { userId }: { userId: string }) {
  yield fork(Create.saga, dataAccess.create, { userId });
  yield fork(Delete.saga, dataAccess.delete, { userId });
  yield fork(Update.saga, dataAccess.update, { userId });
  yield fork(Subscribe.saga, dataAccess.subscribe, { userId });
}
