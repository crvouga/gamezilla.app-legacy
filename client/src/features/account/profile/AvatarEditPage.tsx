import { Casino, ChevronRight, Close, Done } from "@mui/icons-material";
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
  TextField,
  Toolbar,
  Typography,
} from "@mui/material";
import React, { useState } from "react";
import {
  AVATAR_STYLES,
  formatAvatarStyle,
  IAvatarStyle,
  toAvatarUrl,
} from "./avatar";
import { useNavigate } from "react-router-dom";

const ChooseAvatar = (
  {
    seed,
    onClose,
    onChoose,
  }: {
    seed: string;
    onClose: () => void;
    onChoose: (style: IAvatarStyle) => void;
  },
) => {
  return (
    <>
      <AppBar position="sticky">
        <Toolbar>
          <IconButton
            edge="start"
            onClick={onClose}
          >
            <Close />
          </IconButton>

          <Typography variant="h6" sx={{ flex: 1 }}>
            Choose Style
          </Typography>
        </Toolbar>
      </AppBar>

      <Box sx={{ display: "flex", flexWrap: "wrap" }}>
        {Object.values(AVATAR_STYLES).map((
          style,
        ) => (
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

const EditAvatar = (
  {
    onClose,
    onDone,
    style,
    seed,
    onChooseStyle,
    onGenerateRandom,
  }: {
    onClose: () => void;
    onDone: () => void;
    onGenerateRandom: () => void;
    onChooseStyle: () => void;
    style: IAvatarStyle;
    seed: string;
  },
) => {
  const avatarUrl = toAvatarUrl({ avatarSeed: seed, avatarStyle: style });
  return (
    <>
      <AppBar position="sticky">
        <Toolbar>
          <IconButton edge="start" onClick={onClose}>
            <Close />
          </IconButton>

          <Typography variant="h6" sx={{ flex: 1 }}>
            Edit Avatar
          </Typography>

          <IconButton edge="end" onClick={onDone}>
            <Done />
          </IconButton>
        </Toolbar>
      </AppBar>

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
        <ListItem
          divider
          button
          onClick={onChooseStyle}
        >
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
          fullWidth
          size="large"
          startIcon={<Casino />}
          onClick={onGenerateRandom}
        >
          Random
        </Button>
        <TextField label="Avatar Seed" fullWidth />
      </Box>
    </>
  );
};

export const AvatarEditPage = () => {
  const [state, setState] = useState<"initial" | "choosing-avatar-style">(
    "initial",
  );
  const [seed, setSeed] = useState<string>("seed");
  const [style, setStyle] = useState<IAvatarStyle>("adventurer");

  const navigate = useNavigate();

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

  return (
    <EditAvatar
      seed={seed}
      style={style}
      onChooseStyle={() => {
        setState("choosing-avatar-style");
      }}
      onGenerateRandom={() => {
        setSeed(String(Math.random()));
      }}
      onClose={() => {
        navigate(-1);
      }}
      onDone={() => {
        navigate(-1);
      }}
    />
  );
};
