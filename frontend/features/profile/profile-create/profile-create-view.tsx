import React, { useState } from "react";
import { Snackbar, Portal, Appbar } from "react-native-paper";
import { DialogLoading } from "../../../ui/DialogLoading";
import { toAvatarSeed, toAvatarUrl } from "../../../../common";

import { dataAccess } from "./profile-create-data-access";
import { ProfileForm, useProfileForm } from "../profile-form/profile-form";

export const ProfileCreateView = ({
  userId,
  defaultName,
  onLogout,
}: {
  userId: string;
  defaultName: string;
  onLogout: () => void;
}) => {
  const [state, setState] = useState<"idle" | "mutating" | "error" | "success">(
    "idle"
  );

  const onSubmit = async (formValues: any) => {
    setState("mutating");
    const result = await dataAccess.create({
      ...formValues,
      userId,
      avatarUrl: toAvatarUrl(formValues),
    });

    if (result.type === "error") {
      setState("error");
      return;
    }

    setState("success");
  };

  const profileForm = useProfileForm({
    name: defaultName,
    username: defaultName.replace(" ", "").toLocaleLowerCase(),
    avatarSeed: toAvatarSeed(defaultName),
    avatarStyle: "big-ears-neutral",
  });

  return (
    <>
      <Appbar.Header>
        <Appbar.Action icon="logout" onPress={onLogout} />

        <Appbar.Content title="Create Profile" />
      </Appbar.Header>

      <ProfileForm
        onCancel={() => {}}
        onChangeAvatar={() => {}}
        form={profileForm}
      />

      <Portal>
        <DialogLoading
          visible={state === "mutating"}
          title="Creating profile..."
        />
      </Portal>
      <Snackbar
        visible={state === "error"}
        onDismiss={() => {
          setState("idle");
        }}
      >
        Failed to create profile
      </Snackbar>
    </>
  );
};
