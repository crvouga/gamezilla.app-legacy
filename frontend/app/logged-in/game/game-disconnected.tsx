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
import { BackButton } from "../../../ui";

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
        <ListItemButton>
          <ListItemIcon>
            <Add />
          </ListItemIcon>
          <ListItemText primary="Create Game" />
          <ListItemSecondaryAction>
            <ChevronRight />
          </ListItemSecondaryAction>
        </ListItemButton>

        <ListItemButton>
          <ListItemIcon>
            <Search />
          </ListItemIcon>
          <ListItemText primary="Join Game" />
          <ListItemSecondaryAction>
            <ChevronRight />
          </ListItemSecondaryAction>
        </ListItemButton>
      </List>
    </>
  );
};

export default GameDisconnected;
