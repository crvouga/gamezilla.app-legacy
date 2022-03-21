import { StyleSheet, View } from "react-native";
import { Provider } from "react-native-paper";
import { eventChannel, Saga, SagaIterator, Task } from "redux-saga";
import {
  ForkEffect,
  cancel,
  fork,
  put,
  select,
  take,
  takeEvery,
  takeLatest,
  race,
  call,
} from "redux-saga/effects";
import { LoadingDialog } from "../ui-components/Loading";
import { theme } from "../ui-components/theme";
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

/**
 *
 *
 * Saga
 *
 *
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

function* takeWhile<TState>(
  getState: () => TState,
  predicate: (state: TState) => boolean,
  saga: Saga<TState[]>
) {
  let task: Task | null = null;

  while (true) {
    yield take("*");

    const state: TState = yield call(getState);

    if (predicate(state)) {
      task = yield fork(saga, state);
    } else {
      if (task) {
        yield cancel(task);
      }
    }
  }
}

function* watchSelectChange<TState>(
  selector: () => TState,
  didChange: (state1: TState, state2: TState) => boolean,
  saga: (state: TState) => Generator
) {
  let task: Task | null = null;

  while (true) {
    const state1: TState = yield select(selector);

    yield take("*");

    const state2: TState = yield select(selector);

    if (didChange(state1, state2)) {
      if (task) {
        yield cancel(task);
      }

      task = yield fork(saga, state2);
    }
  }
}

export function* saga(dataAccess: IDataAccess) {
  const authActionChan = eventChannel<IAuthState>(dataAccess.onAuthState);

  yield takeEvery(authActionChan, function* (authState) {
    switch (authState.type) {
      case "logged-in":
        return put(actions.loggedIn(authState));

      case "logged-out":
        return put(actions.loggedOut());
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
    <View style={styles.root}>
      <Provider theme={theme}>
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
      </Provider>
    </View>
  );
};
