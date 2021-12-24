import { ChevronRight, Gamepad } from "@mui/icons-material";
import {
  AppBar,
  List,
  ListItem,
  ListItemIcon,
  ListItemSecondaryAction,
  ListItemText,
  Toolbar,
  Typography,
} from "@mui/material";
import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { ProfileContextAvatar } from "src/components/ProfileContextAvatar";

export const HomePage = () => {
  const navigate = useNavigate();

  const handleCreateGame = () => {
    const gameId = "error";
    navigate(`/game/${gameId}`);
  };

  return (
    <>
      <AppBar position="sticky">
        <Toolbar>
          <Typography sx={{ flex: 1 }} variant="h6">
            Home
          </Typography>
          <Link to="/account">
            <ProfileContextAvatar />
          </Link>
        </Toolbar>
      </AppBar>

      <List>
        <ListItem button divider onClick={handleCreateGame}>
          <ListItemIcon>
            <Gamepad />
          </ListItemIcon>
          <ListItemText primary="Play" />
          <ListItemSecondaryAction>
            <ChevronRight />
          </ListItemSecondaryAction>
        </ListItem>
      </List>
    </>
  );
};
