import { ChevronRight, NetworkCell } from "@mui/icons-material";
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

export const TicTacToePage = () => {
  return (
    <>
      <AppBar>
        <Toolbar>
          <Typography variant="h6">Tic Tac Toe</Typography>
        </Toolbar>
      </AppBar>

      <List>
        <ListItemButton>
          <ListItemIcon>
            <NetworkCell />
          </ListItemIcon>
          <ListItemText primary="Create Game" />
          <ListItemSecondaryAction>
            <ChevronRight />
          </ListItemSecondaryAction>
        </ListItemButton>
      </List>
    </>
  );
};
