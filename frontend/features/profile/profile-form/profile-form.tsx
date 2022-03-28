import * as React from "react";
import { useState } from "react";
import { Avatar, TextInput } from "react-native-paper";
import { IAvatarSeed, IAvatarStyle, toAvatarUrl } from "../../../../common";
import { Button, spacing } from "../../../ui";

export type IProfileFormState = {
  username: string;
  name: string;
  avatarSeed: IAvatarSeed;
  avatarStyle: IAvatarStyle;
};

export const useProfileForm = (initialState: IProfileFormState) => {
  const [name, setName] = useState(initialState.name);
  const [username, setUsername] = useState(initialState.username);
  const [avatarSeed, setAvatarSeed] = useState(initialState.avatarSeed);
  const [avatarStyle, setAvatarStyle] = useState(initialState.avatarStyle);

  const avatarUrl = toAvatarUrl({ avatarSeed, avatarStyle });

  return {
    avatarUrl,
    name,
    setName,
    username,
    setUsername,
    avatarSeed,
    setAvatarSeed,
    avatarStyle,
    setAvatarStyle,
  };
};

export const ProfileForm = ({
  onCancel,
  form,
  onChangeAvatar,
}: {
  form: ReturnType<typeof useProfileForm>;
  onChangeAvatar: () => void;
  onCancel: () => void;
}) => {
  return (
    <>
      <Avatar.Image
        style={{
          marginLeft: "auto",
          marginRight: "auto",
          marginTop: spacing(2),
          marginBottom: spacing(1),
        }}
        size={144}
        source={{
          uri: form.avatarUrl,
        }}
      />

      <Button
        style={{ marginBottom: spacing(2) }}
        onPress={onChangeAvatar}
        title={"Change Avatar"}
      />

      <TextInput
        style={{ marginHorizontal: spacing(2), marginBottom: spacing(2) }}
        mode="outlined"
        label="Name"
        value={form.name}
        onChangeText={form.setName}
      />

      <TextInput
        style={{ marginHorizontal: spacing(2), marginBottom: spacing(2) }}
        mode="outlined"
        label="Username"
        value={form.username}
        onChangeText={form.setUsername}
      />
    </>
  );
};
