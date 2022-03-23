import { ChevronRight, Edit } from "@mui/icons-material";
import {
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemSecondaryAction,
  ListItemText,
} from "@mui/material";
import React from "react";
import { Navigate, Route, Routes, useNavigate } from "react-router-dom";
import { eventChannel } from "redux-saga";
import { call, put, takeEvery } from "redux-saga/effects";
import { AppBar, LoadingDialog } from "../../ui-components";
import {
  Action,
  InferActionUnion,
  isActions,
  ISubscription,
} from "../../utils";
import { Home } from "./home";
import { LogoutForm } from "./logout-form";
import {
  parseAvatarUrl,
  toAvatarSeed,
  toAvatarUrl,
} from "./profile/profile-data";
import { ProfileForm } from "./profile/profile-form";

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
      status: "idle" | "updating";
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
  updateProfile: Action<
    "logged-in",
    "update-profile",
    { avatarUrl: string; name: string; username: string }
  >("logged-in", "update-profile"),
  logout: Action("logged-in", "logout"),
};

export type IAction = InferActionUnion<typeof actions>;

export const isAction = (action: unknown): action is IAction => {
  return isActions(actions, action);
};

export const reducer = (state: IState, action: IAction): IState => {
  switch (action.type) {
    case "logged-in::update-profile":
      if (state.child.type === "profile-found") {
        return {
          ...state,
          child: {
            ...state.child,
            status: "updating",
          },
        };
      }

      return state;

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
          status: "idle",
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

export type IUpdateProfile = (values: {
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
  updateProfile: IUpdateProfile;
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
                <ProfileForm
                  title="Create Profile"
                  onCancel={() => {
                    push({ type: "logout" });
                  }}
                  onDone={(values) => {
                    dispatch(
                      actions.createProfile({
                        username: values.username,
                        name: values.name,
                        avatarUrl: toAvatarUrl(values),
                      })
                    );
                  }}
                  defaultValues={{
                    name: defaultName,
                    username: defaultName.replace(" ", "").toLocaleLowerCase(),
                    avatarSeed: toAvatarSeed(defaultName),
                    avatarStyle: "big-ears-neutral",
                  }}
                />
              }
            />

            <Route
              path="/logout"
              element={
                <LogoutForm
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
              element={<Home profile={state.child.profile} push={push} />}
            />

            <Route path="profile">
              <Route
                path=""
                element={
                  <>
                    <AppBar title="Profile" />
                    <List>
                      <ListItemButton
                        onClick={() => {
                          navigate("profile/edit");
                        }}
                      >
                        <ListItemIcon>
                          <Edit />
                        </ListItemIcon>
                        <ListItemText primary="Edit" />
                        <ListItemSecondaryAction>
                          <ChevronRight />
                        </ListItemSecondaryAction>
                      </ListItemButton>
                      <ListItemButton>
                        <ListItemText primary="Delete" />
                      </ListItemButton>
                    </List>
                  </>
                }
              />
              <Route
                path="edit/*"
                element={
                  <ProfileForm
                    title="Edit Profile"
                    defaultValues={{
                      ...parseAvatarUrl(state.child.profile.avatarUrl),
                      username: state.child.profile.username ?? "",
                      name: state.child.profile.name ?? "",
                    }}
                    onCancel={() => {
                      navigate("home", { replace: true });
                    }}
                    onDone={(values) => {
                      dispatch(
                        actions.updateProfile({
                          ...values,
                          avatarUrl: toAvatarUrl(values),
                        })
                      );
                    }}
                  />
                }
              />
            </Route>

            <Route
              path="logout"
              element={
                <LogoutForm
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
