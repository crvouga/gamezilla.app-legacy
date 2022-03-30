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

export const Account = ({
  profile,
}: {
  profile: { username: string; userId: string };
}) => {
  const theme = useTheme();

  return (
    <>
      <Appbar.Header>
        <Appbar.Content title={profile.username} />
      </Appbar.Header>

      <List.Section>
        <List.Item
          onPress={() => {}}
          title="Edit"
          left={() => <List.Icon icon="pencil" />}
          right={() => <List.Icon icon="chevron-right" />}
        />
      </List.Section>

      <Button
        style={styles.button}
        onPress={() => {}}
        icon="logout"
        title="Sign Out"
        color={theme.colors.error}
        mode="outlined"
      />

      <Button
        style={styles.button}
        mode="outlined"
        onPress={() => {}}
        icon="delete"
        title="Delete Profile"
        color={theme.colors.error}
      />
    </>
  );
};
