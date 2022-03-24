import React from "react";
import { Navigate, Route, Routes, useNavigate } from "react-router-dom";
import * as SignIn from "../features/auth/sign-in/sign-in-logic";
import { SignInView } from "../features/auth/sign-in/sign-in-view";
import { SignOutView } from "../features/auth/sign-out/sign-out-view";
import { HomeView } from "../features/home/home-view";
import {
  ProfileCreateView,
  ProfileDeleteView,
  ProfileUpdateView,
  ProfileView,
} from "../features/profile/profile-view";
import { IProfile } from "../features/profile/subscribe/subscribe-logic";
import { LoadingDialog } from "../ui-components";
import { IAction, IState } from "./app-logic";

export const AppView = ({
  state,
  dispatch,
}: {
  state: IState;
  dispatch: (action: IAction) => void;
}) => {
  return (
    <>
      <LoadingDialog
        visible={state.auth.subscribe.type === "loading"}
        title="Checking if logged in..."
      />

      {state.auth.subscribe.type === "signed-in" && (
        <SignedInView
          defaultName={state.auth.subscribe.defaultName}
          dispatch={dispatch}
          state={state}
        />
      )}

      {state.auth.subscribe.type === "signed-out" && (
        <SignedOutView state={state} dispatch={dispatch} />
      )}
    </>
  );
};

const SignedOutView = ({
  state,
  dispatch,
}: {
  state: IState;
  dispatch: (action: IAction) => void;
}) => {
  return <SignInView state={state.auth.signIn} dispatch={dispatch} />;
};

const SignedInView = ({
  dispatch,
  defaultName,
  state,
}: {
  state: IState;
  defaultName: string;
  dispatch: (action: IAction) => void;
}) => {
  return (
    <>
      <LoadingDialog
        visible={state.profile.subscribe.type === "loading"}
        title="Loading profile..."
      />

      {state.profile.subscribe.type === "found" && (
        <ProfileFoundView
          state={state}
          profile={state.profile.subscribe.profile}
          dispatch={dispatch}
        />
      )}

      {state.profile.subscribe.type === "not-found" && (
        <ProfileNotFoundView
          defaultName={defaultName}
          state={state}
          dispatch={dispatch}
        />
      )}
    </>
  );
};

const ProfileFoundView = ({
  dispatch,
  state,
  profile,
}: {
  profile: IProfile;
  state: IState;
  dispatch: (action: IAction) => void;
}) => {
  const navigate = useNavigate();

  return (
    <>
      <Routes>
        <Route
          path="/home"
          element={
            <HomeView
              profile={profile}
              navigate={(action) => {
                if (action.type === "sign-out") {
                  navigate("/sign-out");
                }
                if (action.type === "profile") {
                  navigate("/profile");
                }
              }}
            />
          }
        />

        <Route
          path="/profile"
          element={
            <ProfileView
              navigate={(action) => {
                if (action.type === "back") {
                  navigate("/home", { replace: true });
                }

                if (action.type === "delete") {
                  navigate("/profile/delete");
                }

                if (action.type === "edit") {
                  navigate("/profile/edit");
                }
              }}
            />
          }
        />

        <Route
          path="/profile/edit/*"
          element={
            <ProfileUpdateView
              onCancel={() => {
                navigate("/profile", { replace: true });
              }}
              profile={profile}
              state={state.profile.update}
              dispatch={dispatch}
            />
          }
        />

        <Route
          path="/profile/delete/*"
          element={
            <ProfileDeleteView
              onCancel={() => {
                navigate("/profile", { replace: true });
              }}
              state={state.profile.delete}
              dispatch={dispatch}
            />
          }
        />

        <Route
          path="/sign-out"
          element={
            <SignOutView
              onCancel={() => {
                navigate("/home", { replace: true });
              }}
              state={state.auth.signOut}
              dispatch={dispatch}
            />
          }
        />

        <Route path="*" element={<Navigate to="/home" replace />} />
      </Routes>
    </>
  );
};

const ProfileNotFoundView = ({
  state,
  dispatch,
  defaultName,
}: {
  state: IState;
  dispatch: (action: IAction) => void;
  defaultName: string;
}) => {
  const navigate = useNavigate();

  return (
    <>
      <Routes>
        <Route
          path="/profile/create/*"
          element={
            <ProfileCreateView
              state={state.profile.create}
              onCancel={() => {
                navigate("/sign-out", { replace: true });
              }}
              dispatch={dispatch}
              defaultName={defaultName}
            />
          }
        />

        <Route
          path="/sign-out"
          element={
            <SignOutView
              onCancel={() => {
                navigate("/profile/create", { replace: true });
              }}
              state={state.auth.signOut}
              dispatch={dispatch}
            />
          }
        />
        <Route path="*" element={<Navigate to="/profile/create" replace />} />
      </Routes>
    </>
  );
};
