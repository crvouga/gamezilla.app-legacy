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
  toAvatarUrl,
} from "./avatar";
import { useAvatarEditContext } from "./AvatarEditContext";

export const AvatarEditChoosePage = () => {
  const navigate = useNavigate();
  const { avatarSeed, setAvatarStyle } = useAvatarEditContext();

  const onBack = () => {
    navigate(-1);
  };

  const onChoose = (style: IAvatarStyle) => () => {
    navigate(-1);
    setAvatarStyle(style);
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
        {Object.values(AVATAR_STYLES).map((avatarStyle) => (
          <CardActionArea
            key={avatarStyle}
            sx={{
              width: "50%",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "start",
              padding: 2,
            }}
            onClick={onChoose(avatarStyle)}
          >
            <Avatar
              src={toAvatarUrl({ avatarSeed, avatarStyle })}
              sx={{
                width: 120,
                height: 120,
                marginBottom: 1,
              }}
            />
            <Typography align="center" variant="h6">
              {formatAvatarStyle(avatarStyle)}
            </Typography>
          </CardActionArea>
        ))}
      </Box>
    </>
  );
};
