import React, { useState } from "react";
import { Portal, Snackbar } from "react-native-paper";
import { parseAvatarUrl, toAvatarUrl } from "../../../../common";
import { DialogLoading } from "../../../ui/DialogLoading";
// import { IProfileFormValues, ProfileFormView } from "../profile-form";
import { dataAccess } from "./profile-update-data-access";

export const ProfileUpdateScreen = ({
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

  const onSubmit = async (formValues: any) => {
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

  const defaultValues = {
    name: profile.name ?? "",
    username: profile.username ?? "",
    ...parseAvatarUrl(profile.avatarUrl),
  };

  return (
    <>
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
