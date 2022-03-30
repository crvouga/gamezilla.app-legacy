import * as React from "react";
import { Appbar, List } from "react-native-paper";
import { Button, useTheme } from "../../ui";

export const Profile = ({
  onUpdate,
  onDelete,
  onSignOut,
  onBack,
}: {
  onUpdate: () => void;
  onDelete: () => void;
  onSignOut: () => void;
  onBack: () => void;
}) => {
  const theme = useTheme();

  return (
    <>
      <Appbar.Header>
        <Appbar.BackAction onPress={onBack} />
        <Appbar.Content title="Profile" />
      </Appbar.Header>

      <List.Section>
        <List.Item
          onPress={onUpdate}
          title="Edit"
          left={() => <List.Icon icon="pencil" />}
          right={() => <List.Icon icon="chevron-right" />}
        />
      </List.Section>

      <Button
        onPress={onSignOut}
        icon="logout"
        title="Sign Out"
        color={theme.colors.error}
      />

      <Button
        onPress={onDelete}
        icon="delete"
        title="Delete Profile"
        color={theme.colors.error}
      />
    </>
  );
};
