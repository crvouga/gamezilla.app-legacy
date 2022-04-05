import React, { useState } from "react";
import { FlatList } from "react-native";
import {
  AppBar,
  AppBarBackAction,
  AvatarImage,
  Button,
  ListItem,
  ListItemIcon,
  Loading,
  spacing,
  useTheme,
} from "../../ui";
import {
  ALL_AVATAR_STYLES,
  formatAvatarStyle,
  IAvatarSeed,
  IAvatarStyle,
  toAvatarUrl,
} from "../profile-avatar";
import { ProfileUpdateItem } from "./Item";
import { useProfileUpdateMutation } from "./profile-update-data-access";

export const ProfileUpdateAvatar = ({
  onCancel,
  onAvatarSeed,
  onAvatarStyle,
  onSuccess,
  avatarStyle,
  avatarSeed,
  userId,
}: {
  userId: string;
  avatarStyle: IAvatarStyle;
  avatarSeed: IAvatarSeed;
  onCancel: () => void;
  onSuccess: () => void;
  onAvatarSeed: () => void;
  onAvatarStyle: () => void;
}) => {
  return (
    <>
      <AppBar left={<AppBarBackAction onPress={onCancel} />} title="Avatar" />

      <AvatarImage
        source={{
          uri: toAvatarUrl({ avatarSeed, avatarStyle }),
        }}
        size={144}
        style={{
          marginLeft: "auto",
          marginRight: "auto",
          marginBottom: spacing(2),
        }}
      />

      <ProfileUpdateItem
        title="Avatar Style"
        value={formatAvatarStyle(avatarStyle)}
        onPress={onAvatarStyle}
      />

      <ProfileUpdateItem
        title="Avatar Seed"
        value={avatarSeed}
        onPress={onAvatarSeed}
      />
    </>
  );
};

export const ProfileUpdateAvatarSeed = ({
  onCancel,
}: {
  onCancel: () => void;
}) => {
  const onSave = () => {};

  return (
    <>
      <AppBar
        left={<Button onPress={onCancel} title="Cancel" />}
        title="Avatar Seed"
        right={<Button onPress={onSave} title="Save" />}
      />

      <AvatarImage
        source={{
          uri: "profile.avatarUrl",
        }}
        size={200}
        style={{
          marginLeft: "auto",
          marginRight: "auto",
          marginBottom: spacing(2),
        }}
      />
    </>
  );
};

export const ProfileUpdateAvatarStyle = ({
  onBack,
  avatarSeed,
  initial,
  userId,
  onSuccess,
}: {
  onBack: () => void;
  initial: {
    avatarStyle: IAvatarStyle;
  };
  avatarSeed: IAvatarSeed;
  userId: string;
  onSuccess: () => void;
}) => {
  const theme = useTheme();

  const [avatarStyle, setAvatarStyle] = useState(initial.avatarStyle);

  const profileUpdate = useProfileUpdateMutation({ onSuccess });

  const avatarUrl = toAvatarUrl({ avatarSeed, avatarStyle });

  const onSave = () => {
    profileUpdate.mutate(userId, { avatarUrl });
  };

  return (
    <>
      <Loading visible={profileUpdate.status === "loading"} />

      <AppBar
        left={<Button title="Cancel" onPress={onBack} />}
        title="Avatar Style"
        right={<Button title="Save" onPress={onSave} />}
      />

      <AvatarImage
        source={{
          uri: toAvatarUrl({ avatarSeed, avatarStyle }),
        }}
        size={144}
        style={{
          marginLeft: "auto",
          marginRight: "auto",
          marginBottom: spacing(2),
        }}
      />

      <FlatList
        style={{
          borderTopColor: theme.colors.border,
          borderTopWidth: 2,
          borderStyle: "solid",
        }}
        data={ALL_AVATAR_STYLES}
        renderItem={({ item }) => (
          <ListItem
            onPress={() => {
              setAvatarStyle(item);
            }}
            left={
              <AvatarImage
                style={{ marginRight: spacing(2) }}
                source={{
                  uri: toAvatarUrl({
                    avatarStyle: item,
                    avatarSeed,
                  }),
                }}
              />
            }
            right={item === avatarStyle ? <ListItemIcon icon="check" /> : null}
            title={formatAvatarStyle(item)}
          />
        )}
        keyExtractor={(item) => item}
      />
    </>
  );
};
