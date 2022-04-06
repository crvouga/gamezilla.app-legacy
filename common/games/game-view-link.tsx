import * as React from "react";
import { TouchableHighlight, View } from "react-native";
import { Text } from "react-native-paper";
import { spacing } from "../ui";

export const GameLink = ({
  onPress,
  title,
  icon,
}: {
  onPress: () => void;
  title: string;
  icon: React.ReactNode;
}) => {
  return (
    <View
      style={{
        width: `${(1 / 3) * 100}%`,
        alignItems: "center",
        justifyContent: "center",
        padding: spacing(2),
      }}
    >
      <TouchableHighlight onPress={onPress}>
        <View
          style={{
            width: "100%",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <View
            style={{
              overflow: "hidden",
              width: "100%",
              borderRadius: 12,
              marginBottom: spacing(1),
            }}
          >
            {icon}
          </View>

          <Text
            style={{ textAlign: "center", width: "100%", overflow: "hidden" }}
          >
            {title}
          </Text>
        </View>
      </TouchableHighlight>
    </View>
  );
};
