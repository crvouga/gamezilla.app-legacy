import React, { useState } from "react";
import { TextInput } from "react-native-paper";
import { AppBarContent, AppBarHeader, Button, spacing } from "../../../ui";

export const ProfileUpdateUsername = ({
  onCancel,
  onSuccess,
  profile,
}: {
  onCancel: () => void;
  onSuccess: () => void;
  profile: {
    username: string;
    userId: string;
  };
}) => {
  const [username, setUsername] = useState(profile.username);

  const onSave = () => {};

  return (
    <>
      <AppBarHeader>
        <Button onPress={onCancel} title="Cancel" />
        <AppBarContent title="Username" />
        <Button onPress={onSave} title="Save" />
      </AppBarHeader>

      <TextInput
        style={{
          marginHorizontal: spacing(2),
          marginBottom: spacing(2),
        }}
        mode="outlined"
        label="Username"
        value={username}
        onChangeText={setUsername}
      />
    </>
  );
};
