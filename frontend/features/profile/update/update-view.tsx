import React from "react";
import { LoadingDialog } from "../../../ui-components";
import { parseAvatarUrl, toAvatarUrl } from "../profile-avatar-data";
import { ProfileForm } from "../profile-view-form";
import { actions, IAction, IState } from "./update-logic";

export const ProfileUpdateView = ({
  state,
  onCancel,
  dispatch,
  profile,
}: {
  profile: {
    avatarUrl?: string;
    username?: string;
    name?: string;
  };
  onCancel: () => void;
  state: IState;
  dispatch: (action: IAction) => void;
}) => {
  return (
    <>
      <LoadingDialog
        visible={state.type === "mutating"}
        title="Updating profile..."
      />

      <ProfileForm
        title="Edit Profile"
        defaultValues={{
          ...parseAvatarUrl(profile.avatarUrl),
          username: profile.username ?? "",
          name: profile.name ?? "",
        }}
        onCancel={onCancel}
        submitTitle="Update"
        onSubmit={(values) => {
          dispatch(
            actions.profileUpdate({
              ...values,
              avatarUrl: toAvatarUrl(values),
            })
          );
        }}
      />
    </>
  );
};
