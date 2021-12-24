import { Close } from "@mui/icons-material";
import {
  AppBar,
  Avatar,
  Box,
  CardActionArea,
  IconButton,
  Toolbar,
  Typography,
} from "@mui/material";
import React from "react";
import { useNavigate } from "react-router-dom";
import {
  AVATAR_STYLES,
  formatAvatarStyle,
  IAvatarStyle,
  toAvatarSeed,
  toAvatarUrl,
} from "./avatar";

export const AvatarEditChoosePage = () => {
  const navigate = useNavigate();

  const seed = toAvatarSeed("some-random-seed");

  const onBack = () => {
    navigate(-1);
  };

  const onChoose = (style: IAvatarStyle) => () => {
    console.log({ style });
  };

  return (
    <>
      <AppBar position="sticky">
        <Toolbar>
          <IconButton edge="start" onClick={onBack}>
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
            onClick={onChoose(style)}
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
