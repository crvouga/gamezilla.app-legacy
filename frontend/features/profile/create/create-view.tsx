import React from "react";
import { ProfileForm } from "../profile-view-form";
import { actions, IAction, IState } from "./create-logic";
import { toAvatarSeed, toAvatarUrl } from "../profile-avatar-data";
import { LoadingDialog } from "../../../ui-components";

export const ProfileCreateView = ({
  onCancel,
  defaultName,
  dispatch,
  state,
}: {
  onCancel: () => void;
  defaultName: string;
  dispatch: (action: IAction) => void;
  state: IState;
}) => {
  return (
    <>
      <LoadingDialog
        visible={state.type === "creating"}
        title="Creating profile..."
      />

      <ProfileForm
        title="Create Profile"
        onCancel={onCancel}
        submitTitle="Create"
        onSubmit={(values) => {
          dispatch(
            actions.profileCreate({
              ...values,
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
    </>
  );
};
