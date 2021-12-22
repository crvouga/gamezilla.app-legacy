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

export const AvatarEditPage = () => {
  const [state, setState] = useState<"initial" | "choosing-avatar-style">(
    "initial",
  );
  const [seed, setSeed] = useState<string>("hello");
  const [style, setStyle] = useState<IAvatarStyle>("adventurer");
  const avatarUrl = toAvatarUrl({ avatarStyle: style, avatarSeed: seed });

  if (state === "choosing-avatar-style") {
    return (
      <>
        <AppBar position="sticky">
          <Toolbar>
            <IconButton edge="start">
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
                setState("initial");
                setStyle(style);
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
  }

  return (
    <>
      <AppBar position="sticky">
        <Toolbar>
          <IconButton edge="start">
            <Close />
          </IconButton>

          <Typography variant="h6" sx={{ flex: 1 }}>
            Edit Avatar
          </Typography>

          <IconButton edge="end">
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
          onClick={() => setState("choosing-avatar-style")}
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
          onClick={() => setSeed(String(Math.random()))}
        >
          Random
        </Button>
        <TextField label="Avatar Seed" fullWidth />
      </Box>
    </>
  );
};
