import * as React from "react";
import { StyleSheet, ViewStyle } from "react-native";
import { Avatar } from "react-native-paper";
import { useTheme } from "./theme";

export const AvatarImage = ({
  style,
  source,
  size,
}: {
  style?: ViewStyle;
  source: { uri: string };
  size?: number;
}) => {
  const theme = useTheme();
  return (
    <Avatar.Image
      size={size}
      source={source}
      style={StyleSheet.compose(style, {
        backgroundColor: "transparent",
        borderStyle: "solid",
        borderWidth: 2,
        borderColor: theme.colors.border,
      })}
    />
  );
};
