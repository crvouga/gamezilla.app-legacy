import { ChevronRight } from "@mui/icons-material";
import {
  AppBar,
  Avatar,
  Box,
  Button,
  ButtonBase,
  Grid,
  ListItemButton,
  ListItemSecondaryAction,
  ListItemText,
  TextField,
  Toolbar,
  Typography,
} from "@mui/material";
import React, { useState } from "react";
import { useMutation } from "react-query";
import { Route, Routes, useNavigate } from "react-router-dom";
import {
  AVATAR_STYLES,
  formatAvatarStyle,
  generateRandomAvatarSeed,
  IAvatarSeed,
  IAvatarStyle,
  parseAvatarUrl,
  toAvatarSeed,
  toAvatarUrl,
} from "../../shared/avatar";
import { AspectRatioSquare } from "../components/AspectRatio";
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

  const [avatarStyle, setAvatarStyle] = useState(parsed.avatarStyle);
  const [avatarSeed, setAvatarSeed] = useState(parsed.avatarSeed);

  const navigate = useNavigate();
  const mutation = useMutation(updateProfile, {
    onSuccess: () => {
      navigate(-1);
    },
  });

  const onDone = () => {
    mutation.mutate({
      userId: profile.userId,
      avatarUrl: toAvatarUrl(avatarStyle, avatarSeed),
    });
  };

  return (
    <>
      <ModalLoader
        open={mutation.status === "loading"}
        title="Updating Avatar..."
      />

      <Routes>
        <Route
          path="style"
          element={
            <EditProfileAvatarStyle
              avatarSeed={avatarSeed}
              onSelect={(avatarStyle) => {
                setAvatarStyle(avatarStyle);
                navigate(-1);
              }}
            />
          }
        />

        <Route
          path="seed"
          element={
            <EditProfileAvatarSeed
              avatarSeed={avatarSeed}
              avatarStyle={avatarStyle}
              onChange={(avatarSeed) => {
                setAvatarSeed(avatarSeed);
              }}
              onRandom={() => {
                setAvatarSeed(generateRandomAvatarSeed());
              }}
            />
          }
        />

        <Route
          path=""
          element={
            <EditProfileAvatar
              avatarSeed={avatarSeed}
              avatarStyle={avatarStyle}
              onDone={onDone}
            />
          }
        />
      </Routes>
    </>
  );
};

const EditProfileAvatar = ({
  avatarStyle,
  avatarSeed,
  onDone,
}: {
  avatarStyle: IAvatarStyle;
  avatarSeed: IAvatarSeed;
  onDone?: () => void;
}) => {
  return (
    <>
      <AppBar>
        <Toolbar>
          <Typography sx={{ flex: 1 }} variant="h6">
            Edit Avatar
          </Typography>

          <Button size="large" onClick={onDone}>
            Done
          </Button>
        </Toolbar>
      </AppBar>

      <Box sx={{ width: "100%", display: "grid", placeItems: "center", p: 2 }}>
        <Avatar
          sx={{ width: 160, height: 160 }}
          src={toAvatarUrl(avatarStyle, avatarSeed)}
        />
      </Box>

      <Link href={"style"}>
        <ListItemField
          label="Avatar Style"
          value={formatAvatarStyle(avatarStyle)}
        />
      </Link>

      <Link href={"seed"}>
        <ListItemField label="Avatar Seed" value={avatarSeed} />
      </Link>
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

const EditProfileAvatarStyle = ({
  avatarSeed,
  onSelect,
}: {
  avatarSeed: IAvatarSeed;
  onSelect: (avatarStyle: IAvatarStyle) => void;
}) => {
  return (
    <>
      <AppBar>
        <Toolbar>
          <Typography variant="h6">Choose Style</Typography>
        </Toolbar>
      </AppBar>

      <Grid container>
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
    </>
  );
};

const EditProfileAvatarSeed = ({
  avatarSeed,
  avatarStyle,
  onChange,
  onRandom,
}: {
  avatarStyle: IAvatarStyle;
  avatarSeed: IAvatarSeed;
  onChange: (avatarSeed: IAvatarSeed) => void;
  onRandom: () => void;
}) => {
  return (
    <>
      <AppBar>
        <Toolbar>
          <Typography variant="h6">Edit Avatar Seed</Typography>
        </Toolbar>
      </AppBar>

      <Box sx={{ width: "100%", display: "grid", placeItems: "center", p: 2 }}>
        <Avatar
          sx={{ width: 160, height: 160 }}
          src={toAvatarUrl(avatarStyle, avatarSeed)}
        />
      </Box>

      <Box sx={{ padding: 2 }}>
        <TextField
          fullWidth
          label="Avatar Seed"
          value={avatarSeed}
          onChange={(event) => {
            onChange(toAvatarSeed(event.target.value));
          }}
          sx={{ marginBottom: 2 }}
        />
        <Button fullWidth variant="contained" onClick={onRandom}>
          Random
        </Button>
      </Box>
    </>
  );
};
