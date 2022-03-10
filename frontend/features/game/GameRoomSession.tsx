import { AppBar, Box, Button, Toolbar, Typography } from "@mui/material";
import { Room } from "colyseus.js";
import React from "react";
import { AppBarBackButton } from "../../ui";

const GameRoomSession = ({ room }: { room: Room<unknown> }) => {
  return (
    <Box sx={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <AppBar>
        <Toolbar>
          <AppBarBackButton />

          <Typography sx={{ flex: 1 }} variant="h6">
            Hello
          </Typography>
        </Toolbar>
      </AppBar>

      <Box sx={{ flex: 1, padding: 2 }}></Box>
    </Box>
  );
};

export default GameRoomSession;
