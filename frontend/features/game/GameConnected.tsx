import { ExitToApp } from "@mui/icons-material";
import { AppBar, Box, IconButton, Toolbar, Typography } from "@mui/material";
import { Room } from "colyseus.js";
import React, { useEffect } from "react";
import { Link } from "react-router-dom";

const GameConnected = () => {
  return (
    <Box sx={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <AppBar>
        <Toolbar>
          <Link to="/game/leave" replace>
            <IconButton edge="start" sx={{ marginRight: 2 }}>
              <ExitToApp />
            </IconButton>
          </Link>

          <Typography sx={{ flex: 1 }} variant="h6">
            Game Room
          </Typography>
        </Toolbar>
      </AppBar>

      <Box sx={{ flex: 1, padding: 2 }}></Box>
    </Box>
  );
};

export default GameConnected;
