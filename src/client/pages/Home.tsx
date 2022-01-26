import {
  List,
  ListItemButton,
  ListItemText,
  Toolbar,
  Typography,
} from "@mui/material";
import React from "react";

export const HomePage = ({ profile }: { profile: { avatarUrl?: string } }) => {
  return (
    <>
      <Toolbar>
        <Typography sx={{ flex: 1 }} variant="h4">
          Home
        </Typography>
      </Toolbar>

      <List>
        <ListItemButton href="/tic-tac-toe">
          <ListItemText primary="Play Tic Tac Toe" />
        </ListItemButton>
      </List>
    </>
  );
};
