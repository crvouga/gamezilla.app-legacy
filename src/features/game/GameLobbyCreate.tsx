import { Add, ChevronRight, Search } from "@mui/icons-material";
import {
  AppBar,
  Avatar,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemSecondaryAction,
  ListItemText,
  Toolbar,
  Typography,
} from "@mui/material";
import { generateId } from "../game/game-session-data";
import React from "react";
import { Link, useNavigate } from "react-router-dom";

export const GameLobbyCreate = ({
  profile,
}: {
  profile: { avatarUrl?: string };
}) => {
  const navigate = useNavigate();

  const onCreateGame = () => {
    navigate(`/game-session/${generateId()}`);
  };

  return (
    <>
      <AppBar>
        <Toolbar>
          <Typography sx={{ flex: 1 }} variant="h6">
            Home
          </Typography>

          <Link to="/account">
            <Avatar src={profile.avatarUrl} />
          </Link>
        </Toolbar>
      </AppBar>

      <List>
        <Link to="/game-session/create">
          <ListItemButton>
            <ListItemIcon>
              <Add />
            </ListItemIcon>
            <ListItemText primary="Create Game" />
            <ListItemSecondaryAction>
              <ChevronRight />
            </ListItemSecondaryAction>
          </ListItemButton>
        </Link>

        <ListItemButton>
          <ListItemIcon>
            <Search />
          </ListItemIcon>
          <ListItemText primary="Browse Games" />
          <ListItemSecondaryAction>
            <ChevronRight />
          </ListItemSecondaryAction>
        </ListItemButton>
      </List>
    </>
  );
};
