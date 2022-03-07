import { AspectRatioSquare, ListItemField } from "@libs/components";
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
import { useMutation } from "react-query";
import { Route, Routes, useNavigate } from "react-router-dom";
import { updateProfile } from "./profile-data-access";

const ProfileUpdateAvatar = ({
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

  return (
    <>
      <Routes>
        <Route
          path="style"
          element={
            <ChooseStyle
              avatarSeed={avatarSeed}
              onSelect={(avatarStyle) => {
                setAvatarStyle(avatarStyle);
                navigate(-1);
              }}
            />
          }
        />

        <Route
          path=""
          element={
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
                  onClick={() => {
                    navigate(-1);
                  }}
                >
                  Cancel
                </Button>
                <LoadingButton
                  sx={{ flex: 1 }}
                  variant="contained"
                  loading={mutation.status === "loading"}
                  size="large"
                  onClick={() => {
                    mutation.mutate({
                      userId: profile.userId,
                      avatarUrl: toAvatarUrl(avatarStyle, avatarSeed),
                    });
                  }}
                >
                  Update
                </LoadingButton>
              </Box>
            </Box>
          }
        />
      </Routes>
    </>
  );
};

const ChooseStyle = ({
  avatarSeed,
  onSelect,
}: {
  avatarSeed: IAvatarSeed;
  onSelect: (avatarStyle: IAvatarStyle) => void;
}) => {
  const navigate = useNavigate();
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
          <IconButton
            edge="start"
            onClick={() => {
              navigate(-1);
            }}
          >
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

/**
 *
 *
 * Avatar
 *
 *
 */

export type IAvatarStyle =
  | "adventurer"
  | "adventurer-neutral"
  | "avataaars"
  | "bottts"
  | "big-ears"
  | "big-ears-neutral"
  | "big-smile"
  | "croodles"
  | "croodles-neutral"
  | "gridy"
  | "identicon"
  | "initials"
  | "jdenticon"
  | "micah"
  | "miniavs"
  | "open-peeps"
  | "personas"
  | "pixel-art"
  | "pixel-art-neutral";

export const AVATAR_STYLES: { [avatarStyle in IAvatarStyle]: IAvatarStyle } = {
  adventurer: "adventurer",
  "adventurer-neutral": "adventurer-neutral",
  avataaars: "avataaars",
  "big-ears": "big-ears",
  bottts: "bottts",
  "big-ears-neutral": "big-ears-neutral",
  "big-smile": "big-smile",
  croodles: "croodles",
  "croodles-neutral": "croodles-neutral",
  gridy: "gridy",
  identicon: "identicon",
  initials: "initials",
  jdenticon: "jdenticon",
  micah: "micah",
  miniavs: "miniavs",
  "open-peeps": "open-peeps",
  personas: "personas",
  "pixel-art": "pixel-art",
  "pixel-art-neutral": "pixel-art-neutral",
};

export const ALL_AVATAR_STYLES = Object.keys(AVATAR_STYLES) as IAvatarStyle[];

const capitalize = (word: string) => {
  const [first, ...rest] = word.split("");
  return [first?.toUpperCase() ?? "", ...rest].join("");
};

export const formatAvatarStyle = (avatarStyle: IAvatarStyle) => {
  return avatarStyle.split("-").map(capitalize).join(" ");
};

export const toAvatarStyle = (avatarStyle: string): IAvatarStyle => {
  if (avatarStyle in AVATAR_STYLES) {
    return avatarStyle as IAvatarStyle;
  }

  return "adventurer";
};

export type IAvatarSeed = string & { type: "AvatarSeed" };

export const toAvatarSeed = (seed: string) => {
  return seed.replace(" ", "").replace(";", "").replace(".", "") as IAvatarSeed;
};

const AVATAR_URL_ROOT = `https://avatars.dicebear.com/api`;
const AVATAR_FILE_TYPE = "svg";

export const toAvatarUrl = (style: IAvatarStyle, seed: IAvatarSeed) => {
  const url = new URL(
    `${AVATAR_URL_ROOT}/${style}/${seed}.${AVATAR_FILE_TYPE}`
  );

  if (style === "croodles" || style === "croodles-neutral") {
    url.searchParams.append("backgroundColor", "white");
  }

  return url.toString();
};

export const parseAvatarUrl = (
  avatarUrl?: string
): {
  avatarSeed: IAvatarSeed;
  avatarStyle: IAvatarStyle;
} => {
  try {
    const [avatarStyle, avatarSeed] =
      new URL(avatarUrl ?? "")?.pathname
        ?.split(".")?.[0]
        ?.split("/")
        ?.slice(-2) ?? [];

    if (avatarStyle && avatarSeed) {
      return {
        avatarStyle: toAvatarStyle(avatarStyle),
        avatarSeed: toAvatarSeed(avatarSeed),
      };
    }
    return {
      avatarStyle: toAvatarStyle("adventurer"),
      avatarSeed: toAvatarSeed(""),
    };
  } catch (error) {
    return {
      avatarStyle: toAvatarStyle("adventurer"),
      avatarSeed: toAvatarSeed(""),
    };
  }
};

export const generateRandomAvatarSeed = () => {
  return toAvatarSeed(String(Math.floor(Math.random() * 10000)));
};

export default ProfileUpdateAvatar;
