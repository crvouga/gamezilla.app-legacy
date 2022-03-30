import React, { useState } from "react";
import { StyleSheet, View } from "react-native";
import { Headline } from "react-native-paper";
import { Button, spacing } from "../../../ui";
import { dataAccess } from "./sign-in-data-access";

const styles = StyleSheet.create({
  root: {
    padding: spacing(2),
    justifyContent: "center",
    flex: 1,
  },
  headline: {
    textAlign: "center",
    // fontSize: fontSize(6),
    marginBottom: spacing(2),
  },
});

export const SignIn = () => {
  const [state, setState] = useState<"idle" | "loading">("idle");

  const loginInWithGoogle = async () => {
    setState("loading");

    await dataAccess.signIn({ type: "google" });
  };

  return (
    <>
      <View style={styles.root}>
        <Headline style={styles.headline}>Gamezilla</Headline>

        <Button
          icon="google"
          mode="contained"
          loading={state === "loading"}
          disabled={state === "loading"}
          onPress={loginInWithGoogle}
          title="Continue with Google"
          loadingText="Continuing Wwth Google..."
        />
      </View>
    </>
  );
};
