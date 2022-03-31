import { ReactNode } from "react";
import { List } from "react-native-paper";

export const ListItem = ({
  title,
  onPress,
  left,
}: {
  onPress?: () => void;
  title: string;
  left?: ReactNode;
}) => {
  return <List.Item left={() => left} title={title} onPress={onPress} />;
};
