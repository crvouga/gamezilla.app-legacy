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
import { ProfileCreateForm } from "./profile/profile-create-form";
import { LoadingDialog } from "../../ui-components";

type IProfileState =
  | {
      type: "loading";
    }
  | {
      type: "profile-not-found";
      status: "idle" | "creating";
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
  createProfile: Action<
    "logged-in",
    "create-profile",
    { avatarUrl: string; name: string; username: string }
  >("logged-in", "create-profile"),
  logout: Action("logged-in", "logout"),
};

export type IAction = InferActionUnion<typeof actions>;

export const isAction = (action: unknown): action is IAction => {
  return isActions(actions, action);
};

export const reducer = (state: IState, action: IAction): IState => {
  switch (action.type) {
    case "logged-in::create-profile":
      if (state.child.type === "profile-not-found") {
        return {
          ...state,
          child: {
            ...state.child,
            status: "creating",
          },
        };
      }

      return state;

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
          status: "idle",
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
}) => ISubscription<
  { type: "found"; profile: IProfile } | { type: "not-found" }
>;

export type ICreateProfile = (values: {
  userId: string;
  avatarUrl: string;
  username: string;
  name: string;
}) => Promise<
  { type: "success" } | { type: "error"; errors: { message: string }[] }
>;

export type IDataAccess = {
  onProfile: IOnProfile;
  logout: () => void;
  createProfile: ICreateProfile;
};

function* watchProfileChan(
  result: { type: "found"; profile: IProfile } | { type: "not-found" }
) {
  if (result.type === "found") {
    yield put(actions.profileFound(result));
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

  yield takeEvery(actions.createProfile, function* (action) {
    const result: Awaited<ReturnType<typeof dataAccess.createProfile>> =
      yield call(dataAccess.createProfile, {
        userId,
        ...action.payload,
      });
  });
}

/* 


*/

export const view = ({
  userId,
  defaultName,
  state,
  dispatch,
}: {
  defaultName: string;
  userId: string;
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

  return (
    <>
      <Routes>
        {state.child.type === "loading" && (
          <>
            <Route
              path="/loading"
              element={
                <LoadingDialog
                  visible={state.child.type === "loading"}
                  title="Loading profile..."
                />
              }
            />

            <Route path="*" element={<Navigate to="/loading" replace />} />
          </>
        )}

        {state.child.type === "profile-not-found" && (
          <>
            <Route
              path="profile/create/*"
              element={
                <ProfileCreateForm
                  onCancel={() => {
                    push({ type: "logout" });
                  }}
                  onCreate={(values) => {
                    dispatch(actions.createProfile(values));
                  }}
                  userId={userId}
                  defaultName={defaultName}
                />
              }
            />

            <Route
              path="/logout"
              element={
                <Logout.LogoutDialog
                  onCancel={() => {
                    navigate("profile/create", { replace: true });
                  }}
                  onLogout={() => {
                    dispatch(actions.logout());
                  }}
                />
              }
            />

            <Route path="*" element={<Navigate to="profile/create" />} />
          </>
        )}

        {state.child.type === "profile-found" && (
          <>
            <Route
              path="home"
              element={<Home.view profile={state.child.profile} push={push} />}
            />

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

            <Route path="*" element={<Navigate to="home" />} />
          </>
        )}
      </Routes>
    </>
  );
};
