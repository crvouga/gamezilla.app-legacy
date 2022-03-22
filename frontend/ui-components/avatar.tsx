import React from "react";
import { Avatar as MuiAvatar, AvatarProps } from "@mui/material";

export const Avatar = ({
  src,
  onClick,
}: {
  src?: string;
  onClick?: AvatarProps["onClick"];
}) => {
  return <MuiAvatar src={src} onClick={onClick} />;
};
