import React, { useState } from "react";
import { StyleSheet } from "react-native";
import { Dialog, Headline, Portal } from "react-native-paper";
import { Button, DialogLoading } from "../../../ui";
import { fontSize, spacing } from "../../../ui";
import { dataAccess } from "./sign-in-data-access";

const styles = StyleSheet.create({
  root: {
    padding: spacing(2),
  },
  headline: {
    textAlign: "center",
    fontSize: fontSize(6),
    marginBottom: spacing(2),
  },
});

export const SignInView = () => {
  const [state, setState] = useState<"idle" | "loading">("idle");

  const loginInWithGoogle = async () => {
    setState("loading");

    await dataAccess.signIn({ type: "google" });
  };

  return (
    <>
      <Portal>
        <Dialog
          visible={state === "idle"}
          dismissable={false}
          style={styles.root}
        >
          <Headline style={styles.headline}>Gamezilla</Headline>
          <Button
            icon="google"
            mode="contained"
            loading={state === "loading"}
            disabled={state === "loading"}
            onPress={loginInWithGoogle}
            title="Continue With Google"
          />
        </Dialog>

        <DialogLoading visible={state === "loading"} title="Signing in..." />
      </Portal>
    </>
  );
};
