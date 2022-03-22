import React from "react";
import { Navigate, Route, Routes, useNavigate } from "react-router-dom";
import { eventChannel } from "redux-saga";
import { call, put, takeEvery } from "redux-saga/effects";
import * as UI from "../../ui-components";
import * as Home from "./home/home";
import * as Logout from "./logout/logout-dialog";
import {
  Action,
  InferActionUnion,
  isActions,
  ISubscription,
} from "../../utils";

type IProfileState =
  | {
      type: "loading";
    }
  | {
      type: "profile-not-found";
    }
  | {
      type: "profile-found";
      profile: IProfile;
    };

export type IState = {
  type: "logging-out" | "idle";
  child: IProfileState;
};

export const initialState: IState = {
  type: "idle",
  child: {
    type: "loading",
  },
};

/* 


*/

const actions = {
  profileFound: Action<"logged-in", "profile-found", { profile: IProfile }>(
    "logged-in",
    "profile-found"
  ),
  profileNotFound: Action("logged-in", "profile-not-found"),
  logout: Action("logged-in", "logout"),
};

export type IAction = InferActionUnion<typeof actions>;

export const isAction = (action: unknown): action is IAction => {
  return isActions(actions, action);
};

export const reducer = (state: IState, action: IAction): IState => {
  switch (action.type) {
    case "logged-in::logout":
      return {
        ...state,
        type: "logging-out",
      };

    case "logged-in::profile-found":
      return {
        ...state,
        child: {
          type: "profile-found",
          profile: action.payload.profile,
        },
      };

    case "logged-in::profile-not-found":
      return {
        ...state,
        child: {
          type: "profile-not-found",
        },
      };
  }
};

/* 


*/

export type IProfile = {
  userId: string;
  avatarUrl?: string;
  username?: string;
  name?: string;
  themeMode: "LIGHT" | "DARK" | "SYSTEM";
  gameRoomId?: string;
};

export type IOnProfile = ({
  userId,
}: {
  userId: string;
}) => ISubscription<IProfile | null>;

export type IDataAccess = {
  onProfile: IOnProfile;
  logout: () => void;
};

function* watchProfileChan(profile: IProfile | null) {
  if (profile) {
    yield put(actions.profileFound({ profile }));
  } else {
    yield put(actions.profileNotFound());
  }
}

export function* saga(dataAccess: IDataAccess, { userId }: { userId: string }) {
  const profileChan = eventChannel(dataAccess.onProfile({ userId }));

  yield takeEvery(profileChan, watchProfileChan);
  yield takeEvery(actions.logout, function* () {
    yield call(dataAccess.logout);
  });
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
  type IRoute =
    | {
        type: "home";
      }
    | {
        type: "profile";
      }
    | {
        type: "logout";
      }
    | {
        type: "game";
      };

  const navigate = useNavigate();

  const push = (route: IRoute) => {
    navigate(route.type);
  };

  const back = () => {
    navigate(-1);
  };

  return (
    <>
      <UI.LoadingDialog
        visible={state.child.type === "loading"}
        title="Loading profile..."
      />

      <Routes>
        {state.child.type !== "loading" && (
          <Route
            path="logout"
            element={
              <Logout.LogoutDialog
                onCancel={() => {
                  navigate("home", { replace: true });
                }}
                onLogout={() => {
                  dispatch(actions.logout());
                }}
              />
            }
          />
        )}

        {state.child.type === "profile-found" && (
          <>
            <Route
              path="home"
              element={<Home.view profile={state.child.profile} push={push} />}
            />

            <Route path="*" element={<Navigate to="home" />} />
          </>
        )}
      </Routes>
    </>
  );
};
