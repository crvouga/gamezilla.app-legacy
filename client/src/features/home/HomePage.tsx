import { ChevronRight, Gamepad } from "@mui/icons-material";
import {
  AppBar,
  Avatar,
  List,
  ListItem,
  ListItemIcon,
  ListItemSecondaryAction,
  ListItemText,
  Toolbar,
  Typography,
} from "@mui/material";
import React from "react";
import { useDispatch } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { game } from "../game";

export const HomePage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleCreateGame = () => {
    const action = game.actions.create();
    navigate(`/game/${action.payload.gameId}`);
    dispatch(action);
  };

  return (
    <>
      <AppBar position="sticky">
        <Toolbar>
          <Typography sx={{ flex: 1 }} variant="h6">
            Home
          </Typography>
          <Link to="/account">
            <Avatar />
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
