import { ArrowBack, Casino, ChevronRight, Close } from "@mui/icons-material";
import {
  AppBar,
  Avatar,
  Box,
  Button,
  CardActionArea,
  IconButton,
  List,
  ListItem,
  ListItemAvatar,
  ListItemSecondaryAction,
  ListItemText,
  Toolbar,
  Typography,
} from "@mui/material";
import React, { useState } from "react";
import { useMutation } from "react-query";
import { useNavigate } from "react-router-dom";
import { LoadingDialog } from "src/components/LoadingDialog";
import {
  AVATAR_STYLES,
  formatAvatarStyle,
  IAvatarSeed,
  IAvatarStyle,
  parseAvatarUrl,
  toAvatarSeed,
  toAvatarUrl,
} from "./avatar";
import { profileDataAccess, useProfileContext } from "./profile";

const ChooseAvatar = ({
  seed,
  onClose,
  onChoose,
}: {
  seed: IAvatarSeed;
  onClose: () => void;
  onChoose: (style: IAvatarStyle) => void;
}) => {
  return (
    <>
      <AppBar position="sticky">
        <Toolbar>
          <IconButton edge="start" onClick={onClose}>
            <Close />
          </IconButton>

          <Typography variant="h6" sx={{ flex: 1 }}>
            Choose Style
          </Typography>
        </Toolbar>
      </AppBar>

      <Box sx={{ display: "flex", flexWrap: "wrap" }}>
        {Object.values(AVATAR_STYLES).map((style) => (
          <CardActionArea
            key={style}
            sx={{
              width: "50%",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "start",
              padding: 2,
            }}
            onClick={() => {
              onChoose(style);
            }}
          >
            <Avatar
              src={toAvatarUrl({ avatarSeed: seed, avatarStyle: style })}
              sx={{
                width: 120,
                height: 120,
                marginBottom: 1,
              }}
            />
            <Typography align="center" variant="h6">
              {formatAvatarStyle(style)}
            </Typography>
          </CardActionArea>
        ))}
      </Box>
    </>
  );
};

export const AvatarEditPage = () => {
  const profile = useProfileContext();
  const [state, setState] = useState<"initial" | "choosing-avatar-style">(
    "initial"
  );
  const parsed = parseAvatarUrl(profile.avatarUrl);
  const [seed, setSeed] = useState<IAvatarSeed>(parsed.avatarSeed);
  const [style, setStyle] = useState<IAvatarStyle>(parsed.avatarStyle);
  const avatarUrl = toAvatarUrl({ avatarSeed: seed, avatarStyle: style });

  const navigate = useNavigate();

  const mutation = useMutation({
    mutationFn: () => {
      return profileDataAccess.update({
        ...profile,
        avatarUrl: toAvatarUrl({
          avatarSeed: seed,
          avatarStyle: style,
        }),
      });
    },
  });

  const onSave = () => {
    mutation.mutate();
  };

  const onChooseStyle = () => {
    setState("choosing-avatar-style");
  };

  const onGenerateRandom = () => {
    setSeed(toAvatarSeed(String(Math.random())));
  };

  const onBack = () => {
    navigate(-1);
  };

  const onCancel = () => {
    const parsed = parseAvatarUrl(profile.avatarUrl);
    setSeed(parsed.avatarSeed);
    setStyle(parsed.avatarStyle);
  };

  if (state === "choosing-avatar-style") {
    return (
      <ChooseAvatar
        seed={seed}
        onChoose={(style) => {
          setStyle(style);
          setState("initial");
        }}
        onClose={() => {
          setState("initial");
        }}
      />
    );
  }

  const touched = profile.avatarUrl !== avatarUrl;

  return (
    <>
      <LoadingDialog
        open={mutation.status === "loading"}
        title="Updating Avatar"
      />

      {!touched && (
        <AppBar position="sticky">
          <Toolbar>
            <IconButton edge="start" onClick={onBack}>
              <ArrowBack />
            </IconButton>

            <Typography variant="h6" sx={{ flex: 1 }}>
              Edit Avatar
            </Typography>
          </Toolbar>
        </AppBar>
      )}

      {touched && (
        <AppBar position="sticky">
          <Toolbar>
            <Typography variant="h6" sx={{ flex: 1 }}>
              Save Changes?
            </Typography>

            <Button size="small" sx={{ marginRight: 1 }} onClick={onCancel}>
              Cancel
            </Button>
            <Button size="small" variant="contained" onClick={onSave}>
              Save
            </Button>
          </Toolbar>
        </AppBar>
      )}

      <Avatar
        src={avatarUrl}
        sx={{
          marginX: "auto",
          width: "160px",
          height: "160px",
          marginY: 2,
        }}
      />

      <List>
        <ListItem button onClick={onChooseStyle}>
          <ListItemAvatar>
            <Avatar src={avatarUrl} />
          </ListItemAvatar>
          <ListItemText
            primary={formatAvatarStyle(style)}
            secondary="Choose Style"
          />
          <ListItemSecondaryAction>
            <ChevronRight />
          </ListItemSecondaryAction>
        </ListItem>
      </List>

      <Box sx={{ paddingX: 2 }}>
        <Button
          variant="outlined"
          fullWidth
          size="large"
          startIcon={<Casino />}
          onClick={onGenerateRandom}
        >
          Random
        </Button>
      </Box>
    </>
  );
};
