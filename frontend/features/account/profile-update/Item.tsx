import React from "react";
import { View } from "react-native";
import { Text, TouchableRipple } from "react-native-paper";
import { Icon, spacing } from "../../../ui";

export const ProfileUpdateItem = ({
  title,
  value,
  onPress,
}: {
  title: string;
  value: string;
  onPress: () => void;
}) => {
  return (
    <TouchableRipple onPress={onPress}>
      <View
        style={{
          padding: spacing(2),
          flexDirection: "row",
          alignItems: "center",
        }}
      >
        <Text style={{ flex: 1 }}>{title}</Text>
        <Text style={{ marginRight: spacing(1) }}>{value}</Text>
        <Icon name="chevron-right" />
      </View>
    </TouchableRipple>
  );
};
