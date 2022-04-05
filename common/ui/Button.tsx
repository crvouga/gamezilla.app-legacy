import { ViewStyle } from "react-native";
import { Button as PaperButton } from "react-native-paper";

export const Button = ({
  title,
  onPress,
  mode,
  loading,
  disabled,
  icon,
  color,
  style,
  loadingText,
  compact,
  labelStyle,
}: {
  style?: ViewStyle;
  labelStyle?: ViewStyle;
  compact?: boolean;
  color?: string;
  icon?: string;
  mode?: "contained" | "outlined" | "text";
  loadingText?: string;
  title: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
}) => {
  return (
    <PaperButton
      loading={loading}
      disabled={loading || disabled}
      mode={mode}
      uppercase={false}
      onPress={onPress}
      icon={icon}
      color={color}
      theme={{ roundness: 24 }}
      style={style}
      labelStyle={labelStyle}
      compact={compact}
    >
      {loading ? loadingText ?? title : title}
    </PaperButton>
  );
};
