import * as React from "react";
import { Appbar, List } from "react-native-paper";

export const Home = ({
  onProfile,
  onGame,
}: {
  onProfile: () => void;
  onGame: () => void;
}) => {
  return (
    <>
      <Appbar.Header>
        <Appbar.Content title="Home" />
      </Appbar.Header>

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
