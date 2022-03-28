import * as React from "react";
import { useState } from "react";
import { Appbar, Avatar, TextInput } from "react-native-paper";
import {
  IAvatarSeed,
  IAvatarStyle,
  toAvatarSeed,
  toAvatarUrl,
} from "../../../../common";
import { Button, spacing } from "../../../ui";

export const ProfileAvatarFormScreen = ({
  initialValues,
  onCancel,
}: {
  onCancel: () => void;
  initialValues: {
    avatarSeed: IAvatarSeed;
    avatarStyle: IAvatarStyle;
  };
}) => {
  const [avatarSeed, setAvatarSeed] = useState<IAvatarSeed>(
    initialValues.avatarSeed
  );

  const [avatarStyle, setAvatarStyle] = useState<IAvatarStyle>(
    initialValues.avatarStyle
  );

  return (
    <>
      <Appbar.Header>
        <Appbar.Action icon="close" onPress={onCancel} />
        <Appbar.Content title="Avatar" />
      </Appbar.Header>

      <Avatar.Image
        style={{
          marginLeft: "auto",
          marginRight: "auto",
          marginTop: spacing(2),
          marginBottom: spacing(1),
        }}
        size={144}
        source={{
          uri: toAvatarUrl({ avatarSeed, avatarStyle }),
        }}
      />

      <TextInput
        style={{ marginHorizontal: spacing(1), marginBottom: spacing(2) }}
        mode="outlined"
        label="Avatar Seed"
        value={avatarSeed}
        onChangeText={(text) => setAvatarSeed(toAvatarSeed(text))}
      />

      <Button
        style={{ marginHorizontal: spacing(1), marginBottom: spacing(2) }}
        mode="contained"
        onPress={() => {
          setAvatarSeed(toAvatarSeed(String(Math.random())));
        }}
        title="Generate Seed"
      />

      <Button
        style={{ marginHorizontal: spacing(1), marginBottom: spacing(2) }}
        mode="contained"
        onPress={() => {
          setAvatarSeed(toAvatarSeed(String(Math.random())));
        }}
        title="Submit"
      />
    </>
  );
};
