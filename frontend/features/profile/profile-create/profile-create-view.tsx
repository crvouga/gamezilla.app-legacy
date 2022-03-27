import React, { useState } from "react";
import { Snackbar, Portal, Appbar } from "react-native-paper";
import { DialogLoading } from "../../../ui/DialogLoading";
import { toAvatarSeed, toAvatarUrl } from "../profile-avatar-data";
import { IProfileFormValues, ProfileFormView } from "../profile-form-view";
import { dataAccess } from "./profile-create-data-access";

export const ProfileCreateView = ({
  userId,
  defaultName,
}: {
  userId: string;
  defaultName: string;
}) => {
  const [state, setState] = useState<"idle" | "mutating" | "error" | "success">(
    "idle"
  );

  const onSubmit = async (formValues: IProfileFormValues) => {
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

  const defaultValues: IProfileFormValues = {
    name: defaultName,
    username: defaultName.replace(" ", "").toLocaleLowerCase(),
    avatarSeed: toAvatarSeed(defaultName),
    avatarStyle: "big-ears-neutral",
  };

  return (
    <>
      <Appbar.Header>
        <Appbar.Content title="Create Profile" />
      </Appbar.Header>

      <ProfileFormView
        submitTitle="Create"
        onBack={() => {}}
        onSubmit={onSubmit}
        defaultValues={defaultValues}
        submitting={state === "mutating"}
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
