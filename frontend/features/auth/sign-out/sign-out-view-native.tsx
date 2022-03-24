import React, { useState } from "react";
import { Button, Dialog, Portal, Title } from "react-native-paper";
import { DialogLoading } from "../../../ui/DialogLoading";
import { dataAccess } from "./sign-out-data-access";

export const SignOutView = ({
  visible,
  onCancel,
}: {
  visible: boolean;
  onCancel: () => void;
}) => {
  const [state, setState] = useState<"idle" | "loading">("idle");

  const onSignOut = async () => {
    setState("loading");

    await new Promise((resolve) => {
      setTimeout(resolve, 1000);
    });

    await dataAccess.signOut();

    setState("idle");
  };

  return (
    <Portal>
      <Dialog visible={visible && state === "idle"} onDismiss={onCancel}>
        {/* @ts-ignore */}
        <Dialog.Title>
          <Title>Sign out of Gamezilla?</Title>
        </Dialog.Title>

        <Dialog.Actions>
          <Button onPress={onCancel}>Cancel</Button>
          <Button onPress={onSignOut}>Sign Out</Button>
        </Dialog.Actions>
      </Dialog>

      <DialogLoading visible={state === "loading"} title="Signing out..." />
    </Portal>
  );
};
