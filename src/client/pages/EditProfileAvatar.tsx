import { ChevronRight } from "@mui/icons-material";
import {
  AppBar,
  Avatar,
  Box,
  Button,
  ListItemButton,
  ListItemSecondaryAction,
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
  toAvatarSeed,
  toAvatarUrl,
} from "../../shared/avatar";
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

  const [avatarStyle, setAvatarStyle] = useState<IAvatarStyle>(
    parsed.avatarStyle
  );
  const [avatarSeed, setAvatarSeed] = useState<IAvatarSeed>(parsed.avatarSeed);

  const avatarUrl = toAvatarUrl(avatarStyle, avatarSeed);

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
        <Avatar sx={{ width: 120, height: 120 }} src={avatarUrl} />
      </Box>
      <ListItemField label="Avatar Seed" value={avatarSeed} />
      <ListItemField
        label="Avatar Style"
        value={formatAvatarStyle(avatarStyle)}
      />
    </>
  );
};

const ListItemField = ({ label, value }: { label: string; value?: string }) => {
  return (
    <ListItemButton>
      <ListItemText
        primaryTypographyProps={{
          variant: "body1",
        }}
        primary={label}
        secondaryTypographyProps={{
          variant: "body1",
          color: value ? "text.primary" : "text.disabled",
        }}
        secondary={value ?? label}
      />
      <ListItemSecondaryAction>
        <ChevronRight />
      </ListItemSecondaryAction>
    </ListItemButton>
  );
};

const EditProfileAvatar = ({
  onDone,
  avatarSeed,
  avatarStyle,
}: {
  onDone: () => void;
  avatarSeed: IAvatarSeed;
  avatarStyle: IAvatarStyle;
}) => {
  return (
    <>
      <AppBar>
        <Toolbar>
          <Typography sx={{ flex: 1 }} variant="h6">
            Edit Avatar
          </Typography>
          <Button onClick={onDone}>Done</Button>
        </Toolbar>
      </AppBar>

      <Box sx={{ p: 2, width: "100%", display: "grid", placeItems: "center" }}>
        <Avatar
          sx={{ width: 120, height: 120 }}
          src={toAvatarUrl(avatarStyle, avatarSeed)}
        />
      </Box>
      <ListItemField label="Avatar Seed" value={avatarSeed} />
      <ListItemField
        label="Avatar Style"
        value={formatAvatarStyle(avatarStyle)}
      />
    </>
  );
};

const EditProfileAvatarSeed = () => {
  return <>Hello</>;
};
