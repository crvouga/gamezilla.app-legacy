import { ChevronRight } from "@mui/icons-material";
import {
  AppBar,
  Avatar,
  Box,
  Button,
  ListItem,
  ListItemAvatar,
  ListItemIcon,
  ListItemText,
  TextField,
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

export const EditProfileAvatarPage = ({
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

  return (
    <>
      <ModalLoader open={mutation.status === "loading"} title="Saving..." />

      <AppBar>
        <Toolbar>
          <Typography sx={{ flex: 1 }} variant="h6">
            Edit Avatar
          </Typography>
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

      <Box sx={{ p: 2, width: "100%", display: "grid", placeItems: "center" }}>
        <Avatar
          sx={{ marginBottom: 2, width: 120, height: 120 }}
          src={avatarUrl}
        />

        <Typography variant="h5" sx={{ marginBottom: 4 }}>
          {formatAvatarStyle(selectedStyle)}
        </Typography>

        <TextField label="Avatar Seed" fullWidth />
      </Box>
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
