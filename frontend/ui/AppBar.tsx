import { ReactNode } from "react";
import { View } from "react-native";
import { Appbar } from "react-native-paper";
import { spacing, useTheme } from "./theme";

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
  return (
    <Appbar.Content
      titleStyle={{ textAlign: "center" }}
      title={title}
      subtitle={subtitle}
    />
  );
};

export const AppBarAction = ({
  icon,
  onPress,
}: {
  icon: string;
  onPress: () => void;
}) => {
  const theme = useTheme();

  return (
    <Appbar.Action
      size={36}
      color={theme.colors.text}
      icon={icon}
      onPress={onPress}
      style={{ marginLeft: spacing(-1) }}
    />
  );
};

export const AppBarBackAction = ({ onPress }: { onPress: () => void }) => {
  return <AppBarAction icon="chevron-left" onPress={onPress} />;
};

export const AppBar = ({
  left,
  right,
  title,
}: {
  left?: React.ReactNode;
  right?: React.ReactNode;
  title: string;
}) => {
  const width = `${(1 / 4) * 100}%`;
  return (
    <AppBarHeader>
      <View style={{ alignItems: "flex-start", width }}>{left}</View>
      <AppBarContent title={title} />
      <View style={{ alignItems: "flex-end", width }}>{right}</View>
    </AppBarHeader>
  );
};
