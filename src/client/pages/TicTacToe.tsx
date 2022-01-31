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
      {/* 
      <svg width="100%" viewBox="0 0 3 3">
        <line stroke="black" strokeWidth={0.1} x1={1} y1={0} x2={1} y2={3} />
        <line stroke="black" strokeWidth={0.1} x1={2} y1={0} x2={2} y2={3} />
        <line stroke="black" strokeWidth={0.1} x1={0} y1={1} x2={3} y2={1} />
        <line stroke="black" strokeWidth={0.1} x1={0} y1={2} x2={3} y2={2} />
      </svg> */}

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
