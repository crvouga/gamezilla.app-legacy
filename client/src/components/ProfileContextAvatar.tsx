import React from "react";
import Avatar, { AvatarProps } from "@mui/material/Avatar";
import { useProfileContext } from "src/App";

export const ProfileContextAvatar = (props: AvatarProps) => {
  const profileContext = useProfileContext();
  return <Avatar src={profileContext.avatarUrl} {...props} />;
};
