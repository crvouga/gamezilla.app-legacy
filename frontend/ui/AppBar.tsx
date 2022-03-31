import { ReactNode } from "react";
import { Appbar } from "react-native-paper";

import { useTheme } from ".";

export const AppBarHeader = ({ children }: { children: ReactNode }) => {
  const theme = useTheme();
  return (
    <Appbar.Header style={{ backgroundColor: theme.colors.background }}>
      {children}
    </Appbar.Header>
  );
};

export const AppBarContent = ({
  title,
  subtitle,
}: {
  title: string;
  subtitle?: string;
}) => {
  return <Appbar.Content title={title} subtitle={subtitle} />;
};

export const AppBarBackAction = ({ onPress }: { onPress: () => void }) => {
  return <Appbar.BackAction onPress={onPress} />;
};

export const AppBarAction = ({
  icon,
  onPress,
}: {
  icon: string;
  onPress: () => void;
}) => {
  return <Appbar.Action icon={icon} onPress={onPress} />;
};
