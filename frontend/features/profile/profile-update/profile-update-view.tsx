import React, { useState } from "react";
import { Portal, Snackbar } from "react-native-paper";
import { DialogLoading } from "../../../ui/DialogLoading";
import { parseAvatarUrl, toAvatarUrl } from "../profile-avatar-data";
import {
  IProfileFormValues,
  ProfileFormView,
} from "../profile-form-view-native";
import { dataAccess } from "./profile-update-data-access";

export const ProfileUpdateView = ({
  profile,
}: {
  profile: {
    userId: string;
    name?: string;
    avatarUrl?: string;
    username?: string;
  };
}) => {
  const [state, setState] = useState<"idle" | "mutating" | "error" | "success">(
    "idle"
  );

  const onSubmit = async (formValues: IProfileFormValues) => {
    setState("mutating");

    const result = await dataAccess.update({
      ...formValues,
      userId: profile.userId,
      avatarUrl: toAvatarUrl(formValues),
    });

    if (result.type === "error") {
      setState("error");
      return;
    }

    setState("success");
  };

  const defaultValues: IProfileFormValues = {
    name: profile.name ?? "",
    username: profile.username ?? "",
    ...parseAvatarUrl(profile.avatarUrl),
  };

  return (
    <>
      <ProfileFormView
        onBack={() => {}}
        submitTitle="Update"
        onSubmit={onSubmit}
        defaultValues={defaultValues}
        submitting={state === "mutating"}
      />

      <Portal>
        <DialogLoading
          visible={state === "mutating"}
          title="Updating profile..."
        />
      </Portal>

      <Snackbar
        visible={state === "error"}
        onDismiss={() => {
          setState("idle");
        }}
      >
        Failed to update profile
      </Snackbar>
    </>
  );
};
