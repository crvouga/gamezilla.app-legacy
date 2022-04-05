import React, { useState } from "react";
import { Dialog } from "react-native-paper";
import { Button, DialogLoading } from "../../ui";
import { dataAccess } from "./profile-delete-data-access";

export const ProfileDelete = ({
  onCancel,
  userId,
}: {
  onCancel: () => void;
  userId: string;
}) => {
  const [state, setState] = useState<"idle" | "loading">("idle");

  const onSignOut = async () => {
    setState("loading");

    await dataAccess.delete({ userId });
  };

  return (
    <>
      <Dialog visible={state === "idle"} onDismiss={onCancel}>
        <Dialog.Title>Delete your profile forever?</Dialog.Title>
        <Dialog.Actions>
          <Button onPress={onCancel} title="Cancel" />
          <Button onPress={onSignOut} title="Delete" />
        </Dialog.Actions>
      </Dialog>

      <DialogLoading
        visible={state === "loading"}
        title="Deleting profile..."
      />
    </>
  );
};
