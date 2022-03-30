import * as React from "react";
import { StyleSheet } from "react-native";
import { Appbar, List } from "react-native-paper";
import { Button, spacing, useTheme } from "../../ui";

const styles = StyleSheet.create({
  button: {
    marginHorizontal: spacing(2),
    marginBottom: spacing(2),
  },
});

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
        style={styles.button}
        onPress={onSignOut}
        icon="logout"
        title="Sign Out"
        color={theme.colors.error}
        mode="outlined"
      />

      <Button
        style={styles.button}
        mode="outlined"
        onPress={onDelete}
        icon="delete"
        title="Delete Profile"
        color={theme.colors.error}
      />
    </>
  );
};
