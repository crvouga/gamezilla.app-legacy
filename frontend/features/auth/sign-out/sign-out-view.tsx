import React from "react";
import { LoadingDialog } from "../../../ui-components";
import { DialogConformation } from "../../../ui-components/dialog-confirmation";
import { IState, actions, IAction } from "./sign-out-logic";

export const SignOutView = ({
  onCancel,
  dispatch,
  state,
}: {
  state: IState;
  dispatch: (action: IAction) => void;
  onCancel: () => void;
}) => {
  return (
    <>
      <DialogConformation
        visible={state.type === "idle"}
        title="Log out of Gamezilla?"
        onCancel={onCancel}
        confirmTitle="Logout"
        onConfirm={() => {
          dispatch(actions.signOut());
        }}
      />

      <LoadingDialog
        visible={state.type === "signing-out"}
        title="Signing out..."
      />
    </>
  );
};
