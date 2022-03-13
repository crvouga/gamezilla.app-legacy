import { ExitToApp } from "@mui/icons-material";
import { AppBar, Box, IconButton, Toolbar, Typography } from "@mui/material";
import { Room } from "colyseus.js";
import React, { useEffect } from "react";
import { Link } from "react-router-dom";

const GameConnected = ({ room }: { room: Room<unknown> }) => {
  useEffect(() => {
    room.onError((code, message) => {
      console.log("room.error", {
        sessionId: room.sessionId,
        code,
        message,
      });
    });

    room.onMessage("*", (type, message) => {
      console.log("room.message", {
        sessionId: room.sessionId,
        type,
        message,
      });
    });

    room.onLeave((code) => {
      console.log("room.leave", { sessionId: room.sessionId, code });
    });
  }, []);

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
