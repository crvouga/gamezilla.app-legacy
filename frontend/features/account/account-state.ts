import { eventChannel } from "redux-saga";
import { call, put, takeEvery, takeLeading } from "redux-saga/effects";
import {
  Action,
  ActionType,
  InferActionMap,
  InferActionUnion,
} from "../../utils";
import * as AccountDataAccess from "./account-data-access";

export type IState =
  | {
      type: "loading";
    }
  | {
      type: "logged-out";
    }
  | {
      type: "logging-in";
    }
  | {
      type: "logging-out";
    }
  | {
      type: "logged-in";
      userId: string;
      name?: string;
    };

export const initialState: IState = {
  type: "loading",
};

export const Actions = {
  login: Action<"account", "login", { method: "google" }>("account", "login"),
  logout: Action("account", "logout"),
  loggedIn: Action<"account", "logged-in", { userId: string }>(
    "account",
    "logged-in"
  ),
  loggedOut: Action("account", "logged-out"),
};

export type IAction = InferActionUnion<typeof Actions>;

type IActionMap = InferActionMap<typeof Actions>;

export const reducer = (state: IState, action: IAction): IState => {
  switch (action.type) {
    case ActionType("account", "login"):
      return {
        type: "logging-in",
      };

    case ActionType("account", "logout"):
      return {
        type: "logging-out",
      };

    case ActionType("account", "logged-in"):
      return {
        type: "logged-in",
        userId: action.payload.userId,
      };

    case ActionType("account", "logged-out"):
      return {
        type: "logged-out",
      };

    default:
      return state;
  }
};

/* 



*/

export function* saga() {
  const accountChan = createAccountChan();
  yield takeEvery(accountChan, watchAccountChan);
  yield takeLeading(Actions.login, watchLogin);
  yield takeLeading(Actions.logout, watchLogout);
}

function* watchLogin(action: IActionMap["login"]) {
  yield call(AccountDataAccess.login, { provider: action.payload.method });
}

function* watchLogout(_action: IActionMap["logout"]) {
  yield call(AccountDataAccess.logout);
}

function* watchAccountChan(action: IAction) {
  yield put<IAction>(action);
}

const createAccountChan = () => {
  return eventChannel<IAction>((emit) => {
    return AccountDataAccess.onAuthState((authState) => {
      if (authState.type === "logged-in") {
        emit(Actions.loggedIn({ userId: authState.userId }));
      }

      if (authState.type === "logged-out") {
        emit(Actions.loggedOut());
      }
    });
  });
};
