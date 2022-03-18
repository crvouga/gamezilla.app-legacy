import { Box, useMediaQuery, useTheme } from "@mui/material";
import React from "react";
import { eventChannel } from "redux-saga";
import { put, race, take, takeEvery, takeLatest } from "redux-saga/effects";
import * as AppDataAccess from "./app-data-access";
import * as AppLoggedIn from "./app-logged-in";
import * as AppLoggedOut from "./app-logged-out";
import { Splash } from "./ui";
import { Action, InferActionUnion, isActions } from "./utils";

/* 


*/

export type IState =
  | {
      type: "loading";
    }
  | {
      type: "logged-out";
      child: AppLoggedOut.IState;
    }
  | {
      type: "logged-in";
      userId: string;
      child: AppLoggedIn.IState;
    };

/* 


*/

const Actions = {
  loggedIn: Action<"app", "logged-in", { userId: string }>("app", "logged-in"),
  loggedOut: Action("app", "logged-out"),
};

type IAppAction = InferActionUnion<typeof Actions>;

export type IAction = IAppAction | AppLoggedOut.IAction | AppLoggedIn.IAction;

export const isAction = (action: unknown): action is IAction => {
  return (
    isActions(Actions, action) ||
    AppLoggedOut.isAction(action) ||
    AppLoggedIn.isAction(action)
  );
};

const appReducer = (state: IState, action: IAppAction): IState => {
  switch (action.type) {
    case "app::logged-in":
      return {
        type: "logged-in",
        userId: action.payload.userId,
        child: AppLoggedIn.initialState,
      };

    case "app::logged-out":
      return {
        type: "logged-out",
        child: AppLoggedOut.initialState,
      };
  }
};

const loggedOutReducer = (
  state: IState,
  action: AppLoggedOut.IAction
): IState => {
  if (state.type === "logged-out") {
    return {
      ...state,
      child: AppLoggedOut.reducer(state.child, action),
    };
  }

  return state;
};

const loggedInReducer = (
  state: IState,
  action: AppLoggedIn.IAction
): IState => {
  if (state.type === "logged-in") {
    return {
      ...state,
      child: AppLoggedIn.reducer(state.child, action),
    };
  }

  return state;
};

export const reducer = (state: IState, action: IAction): IState => {
  switch (action.namespace) {
    case "app":
      return appReducer(state, action);

    case "app-logged-out":
      return loggedOutReducer(state, action);

    case "app-logged-in":
      return loggedInReducer(state, action);
  }
};

export const initialState: IState = {
  type: "loading",
};

/* 


*/

type ISubscribeAuthState = (
  emit: (
    authState: { type: "logged-out" } | { type: "logged-in"; userId: string }
  ) => void
) => () => void;

export type ISagaParams = {
  appLoggedIn: AppLoggedIn.ISagaParams;
  appLoggedOut: AppLoggedOut.ISagaParams;
  subscribeAuthState: ISubscribeAuthState;
};

export function* saga(params: ISagaParams) {
  const authStateChan = eventChannel(params.subscribeAuthState);

  yield takeEvery(authStateChan, function* (authState) {
    if (authState.type === "logged-in") {
      yield put(Actions.loggedIn({ userId: authState.userId }));
    }

    if (authState.type === "logged-out") {
      yield put(Actions.loggedOut());
    }
  });

  yield takeLatest(
    [Actions.loggedIn.toString(), Actions.loggedOut.toString()],
    function* (action: IAppAction) {
      if (action.type === "app::logged-in") {
        yield* AppLoggedIn.saga(params.appLoggedIn, {
          userId: action.payload.userId,
        });
      }

      if (action.type === "app::logged-out") {
        yield* AppLoggedOut.saga(params.appLoggedOut);
      }
    }
  );
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
  return (
    <Layout>
      {state.type === "loading" && (
        <Splash subtitle="Checking if logged in..." />
      )}
      {state.type === "logged-out" && (
        <AppLoggedOut.view state={state.child} dispatch={dispatch} />
      )}
      {state.type === "logged-in" && (
        <AppLoggedIn.view state={state.child} dispatch={dispatch} />
      )}
    </Layout>
  );
};

const Layout = ({ children }: { children: React.ReactNode }) => {
  const theme = useTheme();

  const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm"));

  if (isSmallScreen) {
    return (
      <Box
        sx={{
          backgroundColor: theme.palette.background.default,
          width: "100%",
          height: "100%",
          overflow: "hidden",
        }}
      >
        {children}
      </Box>
    );
  }

  return (
    <Box
      sx={{
        margin: "auto",
        width: "100%",
        maxWidth: 500,
        height: "100%",
        display: "flex",
        alignItems: "center",
      }}
    >
      <Box
        sx={{
          border: `1px solid ${theme.palette.divider}`,
          borderRadius: "1rem",
          backgroundColor: theme.palette.background.default,
          width: "100%",
          height: "100%",
          maxHeight: 500 * (16 / 9),
          overflow: "hidden",
        }}
      >
        {children}
      </Box>
    </Box>
  );
};
