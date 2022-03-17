import { eventChannel } from "redux-saga";
import { takeEvery, put, call } from "redux-saga/effects";
import {
  isActions,
  ActionType,
  InferActionUnion,
  Action,
  InferActionMap,
} from "./utils";

export enum IRoute {
  home = "/",
  account = "/account",
  logout = "/logout",
  login = "/login",
  profile = "/profile",
  profileUpdate = "/profile/update",
  profileUpdateUsername = "/profile/update/username",
  profileUpdateName = "/profile/update/name",
  profileUpdateAvatar = "/profile/update/avatar",
  profileCreate = "/profile/create",
}

export type IState = {
  route: IRoute;
};

export const initialState: IState = {
  route: IRoute.home,
};

export const Actions = {
  urlChanged: Action<"routing", "url-changed", string>(
    "routing",
    "url-changed"
  ),
  linkClicked: Action<"routing", "link-clicked", string>(
    "routing",
    "link-clicked"
  ),
  push: Action<"routing", "push", IRoute>("routing", "push"),
};

export const isRoute = (url: string): url is IRoute => {
  return Object.values(IRoute).some((route) => route === url);
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
      if (isRoute(action.payload)) {
        return {
          route: action.payload,
        };
      }

      return {
        route: IRoute.home,
      };

    case ActionType("routing", "link-clicked"):
      if (isRoute(action.payload)) {
        return {
          route: action.payload,
        };
      }

      return {
        route: IRoute.home,
      };
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

function* watchPush(action: IActionMap["push"]) {
  yield call(() => {
    window.history.pushState({}, "", action.payload);
  });
}

export function* saga() {
  const locationChan = createWindowLocationChan();
  yield takeEvery(locationChan, watchWindowLocationChan);

  const pathname = window.location.pathname;

  yield put(Actions.urlChanged(pathname));

  if (!isRoute(pathname)) {
    yield put(Actions.urlChanged("/"));
  }

  yield takeEvery(Actions.push, watchPush);
}

/*


*/
