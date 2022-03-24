import React, { useState } from "react";
import { ViewStyle } from "react-native";
import { Dialog, Portal, Title, useTheme } from "react-native-paper";
import { Button, DialogLoading } from "../../../ui";
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
  };

  return (
    <Portal>
      <Dialog visible={visible && state === "idle"} onDismiss={onCancel}>
        {/* @ts-ignore */}
        <Dialog.Title>
          <Title>Sign out of Gamezilla?</Title>
        </Dialog.Title>

        <Dialog.Actions>
          <Button onPress={onCancel} title="Cancel" />
          <Button onPress={onSignOut} title="Sign Out" />
        </Dialog.Actions>
      </Dialog>

      <DialogLoading visible={state === "loading"} title="Signing out..." />
    </Portal>
  );
};

export const SignOutButton = ({ style }: { style?: ViewStyle }) => {
  const [state, setState] = useState<"idle" | "visible">("idle");

  const onPress = () => {
    setState("visible");
  };

  const onCancel = () => {
    setState("idle");
  };

  const theme = useTheme();

  return (
    <>
      <Button
        mode="outlined"
        icon="logout"
        onPress={onPress}
        title="Sign Out"
        color={theme.colors.error}
        style={style}
      />
      <SignOutView visible={state === "visible"} onCancel={onCancel} />
    </>
  );
};
