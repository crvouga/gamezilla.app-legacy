import React, { useState } from "react";
import { FlatList } from "react-native";
import {
  ALL_AVATAR_STYLES,
  formatAvatarStyle,
  IAvatarSeed,
  IAvatarStyle,
  parseAvatarUrl,
  toAvatarUrl,
} from "../../../../common";
import {
  AppBar,
  AppBarBackAction,
  AvatarImage,
  Button,
  ListItem,
  spacing,
} from "../../../ui";
import { createEventEmitter } from "../../../utils";
import { ProfileUpdateItem } from "./Item";

const eventEmitter = createEventEmitter<{
  CHANGED_AVATAR_STYLE: IAvatarStyle;
  CHANGED_AVATAR_SEED: IAvatarSeed;
}>();

export const ProfileUpdateAvatar = ({
  onCancel,
  onSuccess,
  profile,
  onUpdateAvatarSeed,
  onUpdateAvatarStyle,
  avatarSeed,
  avatarStyle,
}: {
  onCancel: () => void;
  onSuccess: () => void;
  profile: {
    userId: string;
  };
  avatarSeed: IAvatarSeed;
  avatarStyle: IAvatarStyle;
  onUpdateAvatarSeed: ({
    avatarSeed,
    avatarStyle,
  }: {
    avatarSeed: IAvatarSeed;
    avatarStyle: IAvatarStyle;
  }) => void;
  onUpdateAvatarStyle: ({
    avatarSeed,
    avatarStyle,
  }: {
    avatarSeed: IAvatarSeed;
    avatarStyle: IAvatarStyle;
  }) => void;
}) => {
  const onSave = () => {};

  const avatarValues = {
    avatarSeed,
    avatarStyle,
  };

  return (
    <>
      <AppBar
        left={<Button onPress={onCancel} title="Cancel" />}
        title="Avatar"
        right={<Button onPress={onSave} title="Save" />}
      />

      <AvatarImage
        source={{
          uri: toAvatarUrl({ avatarSeed, avatarStyle }),
        }}
        size={200}
        style={{
          marginLeft: "auto",
          marginRight: "auto",
        }}
      />

      <ProfileUpdateItem
        title="Avatar Style"
        value={avatarStyle}
        onPress={() => onUpdateAvatarStyle(avatarValues)}
      />

      <ProfileUpdateItem
        title="Avatar Seed"
        value={avatarSeed}
        onPress={() => onUpdateAvatarSeed(avatarValues)}
      />
    </>
  );
};

export const ProfileUpdateAvatarSeed = ({
  onCancel,
  avatarSeed,
}: {
  onCancel: () => void;
  avatarSeed: IAvatarSeed;
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
  onAvatarStyle,
}: {
  onBack: () => void;
  onAvatarStyle: (avatarStyle: IAvatarStyle) => void;
  avatarSeed: IAvatarSeed;
}) => {
  return (
    <>
      <AppBar
        left={<AppBarBackAction onPress={onBack} />}
        title="Avatar Style"
      />

      <FlatList
        data={ALL_AVATAR_STYLES}
        renderItem={({ item }) => (
          <ListItem
            onPress={() => {
              onAvatarStyle(item);
            }}
            left={() => (
              <AvatarImage
                style={{ backgroundColor: "transparent" }}
                source={{
                  uri: toAvatarUrl({
                    avatarStyle: item,
                    avatarSeed,
                  }),
                }}
              />
            )}
            title={formatAvatarStyle(item)}
          />
        )}
        keyExtractor={(item) => item}
      />
    </>
  );
};
