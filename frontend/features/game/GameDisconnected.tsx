import { Add, ChevronRight, Search } from "@mui/icons-material";
import {
  AppBar,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemSecondaryAction,
  ListItemText,
  Toolbar,
  Typography,
} from "@mui/material";
import React from "react";
import { Link } from "react-router-dom";
import { BackButton } from "../../ui";

const GameDisconnected = () => {
  return (
    <>
      <AppBar>
        <Toolbar>
          <BackButton to="/" />

          <Typography sx={{ flex: 1 }} variant="h6">
            Play Game
          </Typography>
        </Toolbar>
      </AppBar>

      <List>
        <Link to="create">
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

        <Link to="join">
          <ListItemButton>
            <ListItemIcon>
              <Search />
            </ListItemIcon>
            <ListItemText primary="Join Game" />
            <ListItemSecondaryAction>
              <ChevronRight />
            </ListItemSecondaryAction>
          </ListItemButton>
        </Link>
      </List>
    </>
  );
};

export default GameDisconnected;
