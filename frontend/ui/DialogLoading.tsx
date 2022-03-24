import * as React from "react";
import { StyleSheet } from "react-native";
import { ActivityIndicator, Dialog, Title } from "react-native-paper";
import { spacing } from "./theme";

export const DialogLoading = ({
  visible,
  title,
}: {
  visible: boolean;
  title: string;
}) => {
  return (
    <Dialog visible={visible} dismissable={false} style={styles.root}>
      <ActivityIndicator style={styles.activityIndicator} size="large" />
      <Title>{title}</Title>
    </Dialog>
  );
};

const styles = StyleSheet.create({
  activityIndicator: {
    marginRight: spacing(2),
  },

  root: {
    padding: spacing(2),
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
});
