import React, { useState } from "react";
import { TextInput } from "react-native-paper";
import { AppBar, Button, spacing } from "../../../ui";

export const ProfileUpdateName = ({
  onCancel,
  onSuccess,
  profile,
}: {
  onCancel: () => void;
  onSuccess: () => void;
  profile: {
    name: string;
    userId: string;
  };
}) => {
  const [text, setText] = useState(profile.name);

  const onSave = () => {};

  return (
    <>
      <AppBar
        left={<Button onPress={onCancel} title="Cancel" />}
        title="Name"
        right={<Button onPress={onSave} title="Save" />}
      />

      <TextInput
        style={{
          marginHorizontal: spacing(2),
          marginBottom: spacing(2),
        }}
        mode="outlined"
        label="Name"
        value={text}
        onChangeText={setText}
      />
    </>
  );
};
