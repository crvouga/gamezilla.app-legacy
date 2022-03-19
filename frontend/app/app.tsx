import { StyleSheet, View } from "react-native";
import { Provider } from "react-native-paper";
import { eventChannel } from "redux-saga";
import { put, takeEvery, takeLatest } from "redux-saga/effects";
import { LoadingDialog } from "../ui-components/Loading";
import { theme } from "../ui-components/theme";
import { Action, InferActionUnion, isActions, ISubscription } from "../utils";
import * as LoggedIn from "./logged-in/logged-in";
import * as LoggedOut from "./logged-out/logged-out";

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

const styles = StyleSheet.create({
  root: {
    flex: 1,
    width: "100%",
    height: "100%",
    backgroundColor: theme.colors.background,
  },
});

export const view = ({
  state,
  dispatch,
}: {
  state: IState;
  dispatch: (action: IAction) => void;
}) => {
  return (
    <Provider theme={theme}>
      <View style={styles.root}>
        <LoadingDialog
          visible={state.type === "loading"}
          title="Checking if logged in..."
        />

        {state.type === "logged-in" && (
          <LoggedIn.view state={state.child} dispatch={dispatch} />
        )}

        {state.type === "logged-out" && (
          <LoggedOut.view state={state.child} dispatch={dispatch} />
        )}
      </View>
    </Provider>
  );
};
