import React from "react";
import {
  AppBar,
  AppBarBackAction,
  AvatarImage,
  Button,
  spacing,
} from "../../ui";
import { IAvatarSeed, IAvatarStyle, parseAvatarUrl } from "../profile-avatar";
import { ProfileUpdateItem } from "./Item";

export const ProfileUpdate = ({
  profile,
  onCancel,
  onUpdateUsername,
  onUpdateName,
  onUpdateAvatar,
}: {
  profile: {
    userId: string;
    username: string;
    avatarUrl: string;
    name: string;
  };

  onCancel: () => void;
  onUpdateUsername: () => void;
  onUpdateName: () => void;
  onUpdateAvatar: ({
    avatarStyle,
    avatarSeed,
  }: {
    avatarSeed: IAvatarSeed;
    avatarStyle: IAvatarStyle;
  }) => void;
}) => {
  return (
    <>
      <AppBar
        left={<AppBarBackAction onPress={onCancel} />}
        title="Edit Profile"
      />

      <AvatarImage
        style={{
          marginLeft: "auto",
          marginRight: "auto",
          marginTop: spacing(2),
          marginBottom: spacing(1),
        }}
        size={120}
        source={{
          uri: profile.avatarUrl,
        }}
      />

      <Button
        style={{ marginBottom: spacing(2) }}
        onPress={() => onUpdateAvatar(parseAvatarUrl(profile.avatarUrl))}
        title="Change Avatar"
      />

      <ProfileUpdateItem
        title="Name"
        onPress={onUpdateName}
        value={profile.name}
      />

      <ProfileUpdateItem
        title="Username"
        onPress={onUpdateUsername}
        value={profile.username}
      />
    </>
  );
};
