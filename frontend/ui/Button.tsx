import { Button as PaperButton } from "react-native-paper";

export const Button = ({
  title,
  onPress,
  mode,
  loading,
  disabled,
  icon,
}: {
  icon?: string;
  mode?: "contained" | "outlined" | "text";
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
      style={{ borderRadius: 24 }}
    >
      {title}
    </PaperButton>
  );
};
