import { ChevronLeft, ExitToApp } from "@mui/icons-material";
import {
  AppBar,
  Box,
  Button,
  IconButton,
  ListItem,
  ListItemText,
  Toolbar,
  Typography,
} from "@mui/material";
import { Room } from "colyseus.js";
import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import { useAppSelector } from "../../app-store";

const GameConnected = () => {
  const messages = useAppSelector((state) =>
    state.game.type === "connected" ? state.game.messages : []
  );
  return (
    <Box sx={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <AppBar>
        <Toolbar>
          <Link to="/game/leave" replace>
            <Button
              startIcon={<ChevronLeft />}
              sx={{ marginLeft: -1, marginRight: 2 }}
            >
              Leave
            </Button>
          </Link>
        </Toolbar>
      </AppBar>

      <Box sx={{ flex: 1, padding: 2, overflowY: "scroll" }}>
        {messages.map((message, index) => (
          <ListItem key={index}>
            <ListItemText primary={message.type} />
          </ListItem>
        ))}
      </Box>
    </Box>
  );
};

export default GameConnected;
