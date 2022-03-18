import { ChevronLeft } from "@mui/icons-material";
import { LoadingButton } from "@mui/lab";
import {
  AppBar,
  Avatar,
  Box,
  Button,
  ButtonBase,
  Grid,
  IconButton,
  TextField,
  Toolbar,
  Typography,
} from "@mui/material";
import React, { useState } from "react";

import { AspectRatioSquare, ListItemField } from "../../../../ui";
import {
  AVATAR_STYLES,
  formatAvatarStyle,
  generateRandomAvatarSeed,
  IAvatarSeed,
  IAvatarStyle,
  parseAvatarUrl,
  toAvatarSeed,
  toAvatarUrl,
} from "../profile-data";

const ProfileUpdateAvatar = ({
  profile,
}: {
  profile: {
    userId: string;
    avatarUrl?: string;
  };
}) => {
  return <Index profile={profile} />;
};

const Index = ({
  profile,
}: {
  profile: {
    userId: string;
    avatarUrl?: string;
  };
}) => {
  const parsed = parseAvatarUrl(profile.avatarUrl);

  const [avatarStyle, setAvatarStyle] = useState(parsed.avatarStyle);
  const [avatarSeed, setAvatarSeed] = useState(parsed.avatarSeed);

  const isUpdating = false;

  return (
    <Box
      sx={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <AppBar>
        <Toolbar>
          <Typography sx={{ flex: 1 }} variant="h6">
            Edit Avatar
          </Typography>
        </Toolbar>
      </AppBar>

      <Box sx={{ flex: 1 }}>
        <Box
          sx={{
            width: "100%",
            display: "grid",
            placeItems: "center",
            p: 2,
          }}
        >
          <Avatar
            sx={{ width: 160, height: 160 }}
            src={toAvatarUrl(avatarStyle, avatarSeed)}
          />
        </Box>

        <ListItemField
          to={"style"}
          label="Avatar Style"
          value={formatAvatarStyle(avatarStyle)}
        />

        <Box
          sx={{
            padding: 2,
            display: "flex",
            alignItems: "center",
          }}
        >
          <TextField
            sx={{ flex: 1 }}
            label="Avatar Seed"
            value={avatarSeed}
            onChange={(event) => {
              setAvatarSeed(toAvatarSeed(event.target.value));
            }}
          />
          <Button
            sx={{ p: 2 }}
            variant="outlined"
            onClick={() => {
              setAvatarSeed(generateRandomAvatarSeed());
            }}
          >
            Random
          </Button>
        </Box>
      </Box>

      <Box sx={{ p: 2, display: "flex" }}>
        <Button
          variant="outlined"
          sx={{ flex: 1, marginRight: 2 }}
          onClick={() => {}}
        >
          Cancel
        </Button>
        <LoadingButton
          sx={{ flex: 1 }}
          variant="contained"
          loading={isUpdating}
          size="large"
          onClick={() => {}}
        >
          Update
        </LoadingButton>
      </Box>
    </Box>
  );
};

const ChooseStyle = ({
  avatarSeed,
  onSelect,
}: {
  avatarSeed: IAvatarSeed;
  onSelect: (avatarStyle: IAvatarStyle) => void;
}) => {
  return (
    <Box
      sx={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <AppBar>
        <Toolbar>
          <IconButton edge="start" onClick={() => {}}>
            <ChevronLeft />
          </IconButton>
          <Typography variant="h6">Choose Style</Typography>
        </Toolbar>
      </AppBar>

      <Grid container sx={{ flex: 1, overflowY: "scroll" }}>
        {Object.values(AVATAR_STYLES).map((avatarStyle) => (
          <Grid
            key={avatarStyle}
            item
            xs={6}
            sm={4}
            onClick={() => {
              onSelect(avatarStyle);
            }}
          >
            <ButtonBase
              sx={{
                width: "100%",
                height: "100%",
                display: "flex",
                flexDirection: "column",
                padding: 2,
              }}
            >
              <AspectRatioSquare>
                <Avatar
                  sx={{
                    width: "100%",
                    height: "100%",
                  }}
                  src={toAvatarUrl(avatarStyle, avatarSeed)}
                />
              </AspectRatioSquare>

              <Typography sx={{ marginTop: 2 }} variant="h6">
                {formatAvatarStyle(avatarStyle)}
              </Typography>
            </ButtonBase>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default ProfileUpdateAvatar;
