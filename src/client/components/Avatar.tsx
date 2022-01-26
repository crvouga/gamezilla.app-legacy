import MuiAvatar, { AvatarProps } from "@mui/material/Avatar";

export const Avatar = ({
  src,
  sx,
}: {
  src?: string;
  sx?: AvatarProps["sx"];
}) => {
  return <MuiAvatar src={src} sx={sx} />;
};
