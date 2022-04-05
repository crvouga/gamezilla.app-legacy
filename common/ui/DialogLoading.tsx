import * as React from "react";
import { StyleSheet } from "react-native";
import { ActivityIndicator, Dialog, Text } from "react-native-paper";
import { fontSize, spacing } from "./theme";

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

  text: {
    fontSize: fontSize(3),
  },
});

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
      <Text style={styles.text}>{title}</Text>
    </Dialog>
  );
};
