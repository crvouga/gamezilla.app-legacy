import { eventChannel } from "redux-saga";
import { call, fork, put, select, take, takeEvery } from "redux-saga/effects";
import {
  Action,
  ActionType,
  InferActionMap,
  InferActionUnion,
  isActions,
} from "./utils";
import URLPattern from "url-pattern";

export type IAppRoute =
  | {
      type: "home";
    }
  | {
      type: "account";
      child:
        | {
            type: "home";
          }
        | {
            type: "login";
          }
        | {
            type: "logout";
          };
    }
  | {
      type: "profile";
      child:
        | {
            type: "home";
          }
        | {
            type: "update";
            child:
              | {
                  type: "";
                }
              | {
                  type: "username";
                }
              | {
                  type: "avatar";
                }
              | {
                  type: "name";
                };
          }
        | {
            type: "create";
          }
        | {
            type: "delete";
          };
    };

type IRoute<TType extends string> = {
  type: TType;
  child?: IRoute<TType>;
};

export const encode = (route: IRoute<string>): string => {
  if (route.child) {
    return `/${route.type}${encode(route.child)}`;
  }

  return `/${route.type}`;
};

export const decode = (url: string): IAppRoute => {
  if (new URLPattern("/account/*").match(url)) {
    if (url === "/account/logout") {
      return {
        type: "account",
        child: {
          type: "logout",
        },
      };
    }

    if (url === "/account/login") {
      return {
        type: "account",
        child: {
          type: "login",
        },
      };
    }

    return {
      type: "account",
      child: {
        type: "home",
      },
    };
  }

  if (new URLPattern("/profile/*").match(url)) {
    return {
      type: "profile",
      child: {
        type: "home",
      },
    };
  }

  return {
    type: "home",
  };
};

export type IState = {
  route: IAppRoute;
};

export const initialState: IState = {
  route: {
    type: "home",
  },
};

export const Actions = {
  urlChanged: Action<"routing", "url-changed", string>(
    "routing",
    "url-changed"
  ),
  push: Action<"routing", "push", IAppRoute>("routing", "push"),
  pop: Action("routing", "pop"),
};

export type IAction = InferActionUnion<typeof Actions>;

export type IActionMap = InferActionMap<typeof Actions>;

export const isAction = (action: unknown): action is IAction => {
  return isActions(Actions, action);
};

export const reducer = (state: IState, action: IAction): IState => {
  switch (action.type) {
    case ActionType("routing", "push"): {
      return {
        route: action.payload,
      };
    }

    case ActionType("routing", "url-changed"):
      return {
        route: decode(action.payload),
      };

    case ActionType("routing", "pop"):
      return state;
  }
};

/* 



*/

const createWindowLocationChan = () => {
  return eventChannel<IAction>((emit) => {
    const handlePopState = () => {
      emit(Actions.urlChanged(window.location.pathname));
    };
    window.addEventListener("popstate", handlePopState);

    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  });
};

function* watchWindowLocationChan(action: IAction) {
  yield put(action);
}

export function* saga() {
  const locationChan = createWindowLocationChan();
  yield takeEvery(locationChan, watchWindowLocationChan);

  // yield fork(function* () {
  //   while (true) {
  //     yield take("*");

  //     const nextRoute: IAppRoute = yield select(
  //       (state: IAppState) => state.routing.route
  //     );

  //     yield call(() => {
  //       window.history.pushState({}, "", encode(nextRoute));
  //     });
  //   }
  // });

  const pathname = window.location.pathname;
  yield put(Actions.urlChanged(pathname));
}

/*


*/
