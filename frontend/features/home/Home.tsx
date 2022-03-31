import * as React from "react";
import { Appbar, List } from "react-native-paper";
import { AppBarContent, AppBarHeader } from "../../ui";

export const Home = ({
  onProfile,
  onGame,
}: {
  onProfile: () => void;
  onGame: () => void;
}) => {
  return (
    <>
      <AppBarHeader>
        <AppBarContent title="Home" />
      </AppBarHeader>

      <List.Section>
        <List.Item
          onPress={onGame}
          title="Game"
          left={() => <List.Icon icon="gamepad" />}
          right={() => <List.Icon icon="chevron-right" />}
        />

        <List.Item
          onPress={onProfile}
          title="Profile"
          left={() => <List.Icon icon="account" />}
          right={() => <List.Icon icon="chevron-right" />}
        />
      </List.Section>
    </>
  );
};
