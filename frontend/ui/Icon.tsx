import { MaterialIcons } from "@expo/vector-icons";
import { ViewStyle } from "react-native";
import { useTheme } from "./theme";

export type IconName = keyof typeof MaterialIcons.glyphMap;

export const Icon = ({
  size = 24,
  name,
  style,
}: {
  size?: number;
  style?: ViewStyle;
  name: IconName;
}) => {
  const theme = useTheme();

  return (
    <MaterialIcons
      size={size}
      name={name}
      color={theme.colors.text}
      style={style}
    />
  );
};
