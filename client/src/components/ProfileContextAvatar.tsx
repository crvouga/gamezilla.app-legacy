import Avatar, { AvatarProps } from "@mui/material/Avatar";
import React from "react";
import { useLoginSession } from "src/features";

export const ProfileContextAvatar = (props: AvatarProps) => {
  const { profile } = useLoginSession();
  return <Avatar src={profile.avatarUrl} {...props} />;
};
