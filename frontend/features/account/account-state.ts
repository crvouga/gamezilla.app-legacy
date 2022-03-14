import { FunctionsOutlined } from "@mui/icons-material";
import { eventChannel } from "redux-saga";
import { call, put, takeEvery } from "redux-saga/effects";
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

export type IAction =
  | {
      namespace: "account";
      type: "account/login";
      payload: {
        method: "google";
      };
    }
  | {
      namespace: "account";
      type: "account/logout";
    }
  | {
      namespace: "account";
      type: "account/logged-out";
    }
  | {
      namespace: "account";
      type: "account/logged-in";
      payload: {
        userId: string;
        name?: string;
      };
    };

export const reducer = (state: IState, action: IAction): IState => {
  if (action.type === "account/logged-in") {
    return {
      type: "logged-in",
      ...action.payload,
    };
  }

  if (action.type === "account/logged-out") {
    return {
      type: "logged-out",
    };
  }

  return state;
};

/*



*/

export function* saga() {
  const accountChannel = eventChannel<IAction>((emit) => {
    const unsubscribe = AccountDataAccess.onAuthState((authState) => {
      if (authState.type === "logged-in") {
        emit({
          namespace: "account",
          type: "account/logged-in",
          payload: {
            userId: authState.userId,
            name: authState.userMetadata.name,
          },
        });
      }

      if (authState.type === "logged-out") {
        emit({
          namespace: "account",
          type: "account/logged-out",
        });
      }
    });

    return () => {
      unsubscribe();
    };
  });

  yield takeEvery(accountChannel, function* (action) {
    yield put(action);
  });

  yield takeEvery("*", function* (action: IAction) {
    if (action.type === "account/login") {
      yield call(AccountDataAccess.login, { provider: action.payload.method });
    }

    if (action.type === "account/logout") {
      yield call(AccountDataAccess.logout);
    }
  });
}
