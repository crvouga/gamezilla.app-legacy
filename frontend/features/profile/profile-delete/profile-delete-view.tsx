import React, { useState } from "react";
import { ViewStyle } from "react-native";
import { Dialog, Portal, useTheme } from "react-native-paper";
import { Button, DialogLoading, spacing } from "../../../ui";
import { dataAccess } from "./profile-delete-data-access";

export const ProfileDeleteDialog = ({
  visible,
  onCancel,
  userId,
}: {
  visible: boolean;
  onCancel: () => void;
  userId: string;
}) => {
  const [state, setState] = useState<"idle" | "loading">("idle");

  const onSignOut = async () => {
    setState("loading");

    await dataAccess.delete({ userId });
  };

  return (
    <Portal>
      <Dialog visible={visible && state === "idle"} onDismiss={onCancel}>
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
    </Portal>
  );
};

export const ProfileDeleteButton = ({
  userId,
  style,
}: {
  userId: string;
  style?: ViewStyle;
}) => {
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
        icon="delete"
        onPress={onPress}
        title="Delete Profile"
        color={theme.colors.error}
        style={style}
      />

      <ProfileDeleteDialog
        userId={userId}
        visible={state === "visible"}
        onCancel={onCancel}
      />
    </>
  );
};
