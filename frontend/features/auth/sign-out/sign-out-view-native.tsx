import * as React from "react";
import { Button, Dialog, Portal, Title } from "react-native-paper";
import { useAppDispatch, useAppSelector } from "../../../main-store";
import { LoadingDialog } from "../../../ui-components";
import { DialogLoading } from "../../../ui/DialogLoading";
import { actions } from "./sign-out-logic";

export const SignOutView = ({
  visible,
  onCancel,
}: {
  visible: boolean;
  onCancel: () => void;
}) => {
  const state = useAppSelector((state) => state.auth.signOut);
  const dispatch = useAppDispatch();

  const onSignOut = () => {
    dispatch(actions.signOut());
  };

  return (
    <Portal>
      <Dialog visible={visible && state.type === "idle"} onDismiss={onCancel}>
        <Title>Sign out of Gamezilla?</Title>
        <Dialog.Actions>
          <Button onPress={onCancel}>Cancel</Button>
          <Button onPress={onSignOut}>Sign Out</Button>
        </Dialog.Actions>
      </Dialog>

      <DialogLoading
        visible={state.type === "signing-out"}
        title="Signing out..."
      />
    </Portal>
  );
};
