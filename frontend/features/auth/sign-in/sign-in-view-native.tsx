import React from "react";
import { StyleSheet } from "react-native";
import { Button, Dialog, Headline, Portal } from "react-native-paper";
import { useDispatch } from "react-redux";
import { useAppSelector } from "../../../main-store";
import { DialogLoading } from "../../../ui/DialogLoading";
import { fontSize, spacing } from "../../../ui/ThemeProvider";
import { actions } from "./sign-in-logic";

const styles = StyleSheet.create({
  root: {
    padding: spacing(2),
  },
  headline: {
    textAlign: "center",
    fontSize: fontSize(8),
    marginBottom: spacing(2),
  },
});

export const SignInView = () => {
  const state = useAppSelector((state) => state.auth.signIn);
  const dispatch = useDispatch();

  return (
    <>
      <Portal>
        <Dialog
          visible={state.type === "idle"}
          dismissable={false}
          style={styles.root}
        >
          <Headline style={styles.headline}>Gamezilla</Headline>
          <Button
            icon="google"
            mode="contained"
            loading={state.type === "signing-in"}
            disabled={state.type === "signing-in"}
            onPress={() => {
              dispatch(actions.signIn({ type: "google" }));
            }}
          >
            Continue With Google
          </Button>
        </Dialog>

        <DialogLoading
          visible={state.type === "signing-in"}
          title="Signing in..."
        />
      </Portal>
    </>
  );
};
