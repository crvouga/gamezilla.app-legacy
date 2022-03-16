import { eventChannel } from "redux-saga";
import { call, put, takeEvery, takeLeading } from "redux-saga/effects";
import * as AccountDataAccess from "./account-data-access";

export type IState =
  | {
      type: "loading";
    }
  | {
      type: "logged-out";
    }
  | {
      type: "logged-in";
      userId: string;
      name?: string;
    };

export enum ActionType {
  LoggedIn = "account/logged-in",
  LoggedOut = "account/logged-out",
  Login = "account/login",
  Logout = "account/logout",
}

export type ILoggedIn = {
  namespace: "account";
  type: ActionType.LoggedIn;
  payload: {
    userId: string;
  };
};

type ILoggedOut = {
  namespace: "account";
  type: ActionType.LoggedOut;
};

type ILogin = {
  namespace: "account";
  type: ActionType.Login;
  payload: {
    method: "google";
  };
};

type ILogout = {
  namespace: "account";
  type: ActionType.Logout;
};

export type IAction = ILoggedIn | ILoggedOut | ILogin | ILogout;

export const initialState: IState = {
  type: "loading",
};

export const reducer = (state: IState, action: IAction): IState => {
  switch (action.type) {
    case ActionType.LoggedIn:
      return {
        type: "logged-in",
        userId: action.payload.userId,
      };

    case ActionType.LoggedOut:
      return {
        type: "logged-out",
      };

    default:
      return state;
  }
};

/* 



*/

function* watchLogin(action: ILogin) {
  yield call(AccountDataAccess.login, { provider: action.payload.method });
}

function* watchLogout(_action: ILogout) {
  yield call(AccountDataAccess.logout);
}

function* watchAccountChan(action: IAction) {
  yield put<IAction>(action);
}

const createAccountChan = () => {
  return eventChannel<IAction>((emit) => {
    return AccountDataAccess.onAuthState((authState) => {
      if (authState.type === "logged-in") {
        emit({
          namespace: "account",
          type: ActionType.LoggedIn,
          payload: {
            userId: authState.userId,
          },
        });
      }

      if (authState.type === "logged-out") {
        emit({
          namespace: "account",
          type: ActionType.LoggedOut,
        });
      }
    });
  });
};

export function* saga() {
  const accountChan = createAccountChan();
  yield takeEvery(accountChan, watchAccountChan);
  yield takeLeading(ActionType.Login, watchLogin);
  yield takeLeading(ActionType.Logout, watchLogout);
}
