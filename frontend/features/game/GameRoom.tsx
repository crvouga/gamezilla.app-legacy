import { AppBar, Box, Toolbar, Typography } from "@mui/material";
import { Room } from "colyseus.js";
import React, { useEffect } from "react";
import { AppBarBackButton } from "../../ui";

const GameRoom = ({ room }: { room: Room<unknown> }) => {
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

    return () => {
      room.leave();
    };
  }, []);

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

export default GameRoom;
