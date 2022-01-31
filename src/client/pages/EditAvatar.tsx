import { ChevronRight } from "@mui/icons-material";
import {
  AppBar,
  Avatar,
  Button,
  ListItem,
  ListItemAvatar,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Typography,
} from "@mui/material";
import React, { useState } from "react";
import { useMutation } from "react-query";
import {
  AVATAR_STYLES,
  formatAvatarStyle,
  IAvatarSeed,
  IAvatarStyle,
  parseAvatarUrl,
  toAvatarUrl,
} from "../../shared/avatar";
import { Link } from "../components/Link";
import { ModalLoader } from "../components/ModalLoader";
import { updateProfile } from "../data-access";

export const EditAvatarPage = ({
  profile,
}: {
  profile: {
    userId: string;
    avatarUrl?: string;
  };
}) => {
  const parsed = parseAvatarUrl(profile.avatarUrl);

  const [selectedStyle, setSelectedStyle] = useState<IAvatarStyle>(
    parsed.avatarStyle
  );

  const avatarUrl = toAvatarUrl(selectedStyle, parsed.avatarSeed);

  const mutation = useMutation(updateProfile);

  if (mutation.status === "loading") {
    return <ModalLoader title="Saving..." />;
  }

  return (
    <>
      <AppBar>
        <Toolbar>
          <Button
            onClick={() => {
              setSelectedStyle(parsed.avatarStyle);
            }}
          >
            Cancel
          </Button>
          <Typography variant="h6">Edit Avatar</Typography>
          <Button
            onClick={() => {
              mutation.mutate({
                userId: profile.userId,
                avatarUrl,
              });
            }}
          >
            Done
          </Button>
        </Toolbar>
      </AppBar>

      <div className="w-full flex flex-col justify-center items-center mt-4 mb-6">
        <Avatar src={avatarUrl} />

        <div className="text-2xl font-medium">
          {formatAvatarStyle(selectedStyle)}
        </div>
      </div>

      <Link href="choose-style">
        <ListItem>
          <ListItemAvatar>
            <Avatar src={avatarUrl} />
            <ListItemText primary="Choose Style" />
            <ListItemIcon>
              <ChevronRight />
            </ListItemIcon>
          </ListItemAvatar>
        </ListItem>
      </Link>
    </>
  );
};

export const EditAvatarChooseStyle = ({
  avatarSeed,
  selectedStyle,
  onSelect,
}: {
  avatarSeed: IAvatarSeed;
  selectedStyle: IAvatarStyle;
  onSelect: (style: IAvatarStyle) => void;
}) => {
  return (
    <div>
      {Object.values(AVATAR_STYLES).map((avatarStyle) => (
        <div key={avatarStyle} className="w-full flex-1">
          <Avatar
            sx={{ width: "100%" }}
            src={toAvatarUrl(avatarStyle, avatarSeed)}
          />
          <div className="font-medium text-lg text-center p-2">
            {formatAvatarStyle(avatarStyle)}
          </div>
        </div>
      ))}
    </div>
  );
};
