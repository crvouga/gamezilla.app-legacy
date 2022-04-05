import React, { useState } from "react";
import { Dialog } from "react-native-paper";
import { Button, DialogLoading } from "../../ui";
import { dataAccess } from "./sign-out-data-access";

export const SignOut = ({ onCancel }: { onCancel: () => void }) => {
  const [state, setState] = useState<"idle" | "loading">("idle");

  const onSignOut = async () => {
    setState("loading");

    await new Promise((resolve) => {
      setTimeout(resolve, 1000);
    });

    await dataAccess.signOut();
  };

  return (
    <>
      <Dialog visible={state === "idle"} onDismiss={onCancel}>
        <Dialog.Title>Sign out of Gamezilla?</Dialog.Title>

        <Dialog.Actions>
          <Button onPress={onCancel} title="Cancel" />
          <Button onPress={onSignOut} title="Sign Out" />
        </Dialog.Actions>
      </Dialog>

      <DialogLoading visible={state === "loading"} title="Signing out..." />
    </>
  );
};
