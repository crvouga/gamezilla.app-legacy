import { Box, useMediaQuery, useTheme } from "@mui/material";
import React from "react";
import { eventChannel } from "redux-saga";
import { put, takeEvery, takeLatest } from "redux-saga/effects";
import { Splash } from "../ui";
import { Action, InferActionUnion, isActions, ISubscription } from "../utils";
import { AppThemeProvider } from "./app-theme";
import { LoggedIn } from "./logged-in";
import { LoggedOut } from "./logged-out";

/* 


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
      child: LoggedIn.IState;
    };

export const initialState: IState = {
  type: "loading",
};

/* 


*/

const actions = {
  loggedIn: Action<"app", "logged-in", { userId: string }>("app", "logged-in"),
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

/* 


*/

export type IAuthState =
  | { type: "logged-out" }
  | { type: "logged-in"; userId: string };

export type IOnAuthState = ISubscription<IAuthState>;

export type IDataAccess = {
  loggedIn: LoggedIn.IDataAccess;
  loggedOut: LoggedOut.IDataAccess;
  onAuthState: IOnAuthState;
};

export function* saga(dataAccess: IDataAccess) {
  const authStateChan = eventChannel(dataAccess.onAuthState);

  yield takeEvery(authStateChan, function* (authState) {
    if (authState.type === "logged-in") {
      yield put(actions.loggedIn({ userId: authState.userId }));
    }

    if (authState.type === "logged-out") {
      yield put(actions.loggedOut());
    }
  });

  yield takeLatest(
    [actions.loggedIn.toString(), actions.loggedOut.toString()],
    function* (action: IAppAction) {
      if (action.type === "app::logged-in") {
        yield* LoggedIn.saga(dataAccess.loggedIn, {
          userId: action.payload.userId,
        });
      }

      if (action.type === "app::logged-out") {
        yield* LoggedOut.saga(dataAccess.loggedOut);
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
    <AppThemeProvider>
      <Layout>
        {state.type === "loading" && (
          <Splash subtitle="Checking if logged in..." />
        )}
        {state.type === "logged-out" && (
          <LoggedOut.view state={state.child} dispatch={dispatch} />
        )}
        {state.type === "logged-in" && (
          <LoggedIn.view state={state.child} dispatch={dispatch} />
        )}
      </Layout>
    </AppThemeProvider>
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
