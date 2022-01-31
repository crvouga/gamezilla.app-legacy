import { ChevronRight } from "@mui/icons-material";
import {
  AppBar,
  Avatar,
  Box,
  ButtonBase,
  Dialog,
  Grid,
  ListItemButton,
  ListItemSecondaryAction,
  ListItemText,
  Toolbar,
  Typography,
} from "@mui/material";
import React from "react";
import {
  AVATAR_STYLES,
  formatAvatarStyle,
  IAvatarSeed,
  IAvatarStyle,
  parseAvatarUrl,
  toAvatarUrl,
} from "../../shared/avatar";
import {
  Router,
  ReactLocation,
  useRouter,
  useResolvePath,
  useNavigate,
  useLocation,
} from "react-location";
import { useRef } from "react";
import { useReducer } from "react";
import { useState } from "react";
import { Link } from "../components/Link";

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

  const location = useLocation();
  const resolvePath = useResolvePath();
  const navigate = useNavigate();

  return (
    <>
      <Router
        location={location}
        routes={[
          {
            path: resolvePath("style"),
            element: (
              <EditProfileAvatarStyle
                avatarSeed={avatarSeed}
                onSelect={(avatarStyle) => {
                  setAvatarStyle(avatarStyle);
                  navigate({
                    to: resolvePath("."),
                    replace: true,
                  });
                }}
              />
            ),
          },

          {
            path: resolvePath("."),
            element: (
              <EditProfileAvatar
                avatarSeed={avatarSeed}
                avatarStyle={avatarStyle}
              />
            ),
          },
        ]}
      />
    </>
  );
};

const EditProfileAvatar = ({
  avatarStyle,
  avatarSeed,
}: {
  avatarStyle: IAvatarStyle;
  avatarSeed: IAvatarSeed;
}) => {
  const resolvePath = useResolvePath();

  return (
    <>
      <AppBar>
        <Toolbar>
          <Typography variant="h6">Edit Avatar</Typography>
        </Toolbar>
      </AppBar>

      <Box sx={{ width: "100%", display: "grid", placeItems: "center", p: 2 }}>
        <Avatar
          sx={{ width: 120, height: 120 }}
          src={toAvatarUrl(avatarStyle, avatarSeed)}
        />
      </Box>

      <Link href={resolvePath("style")}>
        <ListItemField
          label="Avatar Style"
          value={formatAvatarStyle(avatarStyle)}
        />
      </Link>

      <ListItemField label="Avatar Seed" value={avatarSeed} />
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
            onClick={() => {
              onSelect(avatarStyle);
            }}
          >
            <ButtonBase
              sx={{
                width: "100%",
                display: "flex",
                flexDirection: "column",
                padding: 2,
              }}
            >
              <Box
                sx={{
                  width: "100%",
                  paddingTop: "100%",
                  height: 0,
                  position: "relative",
                }}
              >
                <Avatar
                  sx={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    width: "100%",
                    height: "100%",
                  }}
                  src={toAvatarUrl(avatarStyle, avatarSeed)}
                />
              </Box>

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
