import React from "react";
import { eventChannel } from "redux-saga";
import { put, takeEvery, takeLatest } from "redux-saga/effects";
import { LoadingDialog } from "../ui-components";
import { Action, InferActionUnion, isActions, ISubscription } from "../utils";
import * as LoggedIn from "./logged-in/logged-in";
import * as LoggedOut from "./logged-out/logged-out";

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
      type: "logged-out";
      child: LoggedOut.IState;
    }
  | {
      type: "logged-in";
      userId: string;
      defaultName: string;
      child: LoggedIn.IState;
    };

export const initialState: IState = {
  type: "loading",
};

/**
 *
 *
 * Actions
 *
 *
 */

export const actions = {
  loggedIn: Action<"app", "logged-in", { userId: string; defaultName: string }>(
    "app",
    "logged-in"
  ),
  loggedOut: Action("app", "logged-out"),
};

type IAppAction = InferActionUnion<typeof actions>;

export type IAction = IAppAction | LoggedOut.IAction | LoggedIn.IAction;

export const isAction = (action: unknown): action is IAction => {
  return (
    isActions(actions, action) ||
    LoggedOut.isAction(action) ||
    LoggedIn.isAction(action)
  );
};

export const reducer = (state: IState, action: IAction): IState => {
  switch (action.namespace) {
    case "app":
      switch (action.type) {
        case "app::logged-in":
          return {
            type: "logged-in",
            userId: action.payload.userId,
            defaultName: action.payload.defaultName,
            child: LoggedIn.initialState,
          };

        case "app::logged-out":
          return {
            type: "logged-out",
            child: LoggedOut.initialState,
          };
      }

    case "logged-out":
      if (state.type === "logged-out") {
        return {
          ...state,
          child: LoggedOut.reducer(state.child, action),
        };
      }

      return state;

    case "logged-in":
      if (state.type === "logged-in") {
        return {
          ...state,
          child: LoggedIn.reducer(state.child, action),
        };
      }

      return state;
  }
};

/**
 *
 *
 * Saga
 *
 *
 */

export type IAuthState =
  | {
      type: "logged-out";
    }
  | {
      type: "logged-in";
      userId: string;
      defaultName: string;
    };

export type IOnAuthState = ISubscription<IAuthState>;

export type IDataAccess = {
  loggedIn: LoggedIn.IDataAccess;
  loggedOut: LoggedOut.IDataAccess;
  onAuthState: IOnAuthState;
};

export function* saga(dataAccess: IDataAccess) {
  const authChan = eventChannel<IAuthState>(dataAccess.onAuthState);

  yield takeEvery(authChan, function* (authState) {
    switch (authState.type) {
      case "logged-in":
        yield put(actions.loggedIn(authState));
        return;

      case "logged-out":
        yield put(actions.loggedOut());
        return;
    }
  });

  yield takeLatest(actions.loggedIn, function* (action) {
    yield* LoggedIn.saga(dataAccess.loggedIn, {
      userId: action.payload.userId,
    });
  });

  yield takeLatest(actions.loggedOut, function* (action) {
    yield* LoggedOut.saga(dataAccess.loggedOut);
  });
}

/**
 *
 *
 * View
 *
 *
 */

export const view = ({
  state,
  dispatch,
}: {
  state: IState;
  dispatch: (action: IAction) => void;
}) => {
  return (
    <>
      <LoadingDialog
        visible={state.type === "loading"}
        title={"Checking if logged in..."}
      />

      {state.type === "logged-in" && (
        <LoggedIn.view
          defaultName={state.defaultName}
          userId={state.userId}
          state={state.child}
          dispatch={dispatch}
        />
      )}

      {state.type === "logged-out" && (
        <LoggedOut.view state={state.child} dispatch={dispatch} />
      )}
    </>
  );
};
