import { ReactNode } from "react";
import { List } from "react-native-paper";
import { IconName } from "./Icon";

export const ListItem = ({
  title,
  onPress,
  left,
  right,
}: {
  onPress?: () => void;
  title: string;
  left?: ReactNode;
  right?: ReactNode;
}) => {
  return (
    <List.Item
      left={() => left}
      title={title}
      onPress={onPress}
      right={() => right}
    />
  );
};

export const ListItemIcon = ({ icon }: { icon: IconName }) => {
  return <List.Icon icon={icon} />;
};
