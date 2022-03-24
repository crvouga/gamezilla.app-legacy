import React from "react";
import { DialogConformation, LoadingDialog } from "../../../ui-components";
import { actions, IAction, IState } from "./delete-logic";

export const ProfileDeleteView = ({
  onCancel,
  state,
  dispatch,
}: {
  onCancel: () => void;
  state: IState;
  dispatch: (action: IAction) => void;
}) => {
  return (
    <>
      <LoadingDialog
        visible={state.type === "mutating"}
        title="Deleting profile..."
      />

      <DialogConformation
        visible={state.type === "idle"}
        title="Delete profile forever"
        confirmTitle="Delete"
        onCancel={onCancel}
        onConfirm={() => {
          dispatch(actions.profileDelete());
        }}
      />
    </>
  );
};
