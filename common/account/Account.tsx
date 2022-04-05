import * as React from "react";
import { StyleSheet } from "react-native";
import { Title } from "react-native-paper";
import { AppBar, AppBarContent, AppBarHeader, Button, spacing } from "../ui";
import { AvatarImage } from "../ui/Avatar";

const styles = StyleSheet.create({
  button: {
    marginHorizontal: spacing(2),
    marginBottom: spacing(2),
  },
});

export const Account = ({
  profile,
  onProfileUpdate,
}: {
  profile: {
    username: string;
    avatarUrl: string;
  };
  onProfileUpdate: () => void;
}) => {
  return (
    <>
      <AppBar title={profile.username} />

      <AvatarImage
        style={{
          marginLeft: "auto",
          marginRight: "auto",
        }}
        size={144}
        source={{ uri: profile.avatarUrl }}
      />

      <Title
        style={{ textAlign: "center", marginBottom: spacing(2) }}
      >{`@${profile.username}`}</Title>

      <Button
        icon="pencil"
        title="Edit Profile"
        onPress={onProfileUpdate}
        mode="outlined"
        style={{ marginHorizontal: spacing(2) }}
      />
    </>
  );
};
