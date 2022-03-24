import React from "react";
import { SignInView } from "../features/auth/sign-in/sign-in-view";
import { SignOutView } from "../features/auth/sign-out/sign-out-view";
import { LoadingDialog } from "../ui-components";
import {
  IState,
  IAction,
  ISignedInState,
  ISignedOutState,
  IProfileFoundState,
} from "./app-logic";

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
        visible={state.type === "loading"}
        title="Checking if logged in..."
      />

      {state.type === "signed-in" && (
        <SignedInView dispatch={dispatch} state={state} />
      )}

      {state.type === "signed-out" && (
        <SignedOutView state={state} dispatch={dispatch} />
      )}
    </>
  );
};

const SignedOutView = ({
  state,
  dispatch,
}: {
  state: ISignedOutState;
  dispatch: (action: IAction) => void;
}) => {
  return <SignInView state={state.signIn} dispatch={dispatch} />;
};

const SignedInView = ({
  state,
  dispatch,
}: {
  state: ISignedInState;
  dispatch: (action: IAction) => void;
}) => {
  return (
    <>
      <LoadingDialog
        visible={state.profile.type === "loading"}
        title="Loading profile..."
      />

      {state.profile.type === "found" && (
        <ProfileFoundView state={state.profile} dispatch={dispatch} />
      )}
      {state.profile.type === "not-found" && <ProfileNotFoundView />}
    </>
  );
};

const ProfileFoundView = ({
  state,
  dispatch,
}: {
  state: IProfileFoundState;
  dispatch: (action: IAction) => void;
}) => {
  return (
    <>
      <SignOutView
        onCancel={() => {}}
        state={state.signOut}
        dispatch={dispatch}
      />
    </>
  );
};

const ProfileNotFoundView = () => {
  return <>profile not found</>;
};
