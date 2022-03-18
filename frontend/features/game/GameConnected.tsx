import { ChevronLeft } from "@mui/icons-material";
import {
  AppBar,
  Box,
  Button,
  ListItem,
  ListItemText,
  Toolbar,
} from "@mui/material";
import React from "react";
import { useAppSelector } from "../../app-store";

const GameConnected = () => {
  const messages = useAppSelector((state) =>
    state.game.type === "connected" ? state.game.messages : []
  );
  return (
    <Box sx={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <AppBar>
        <Toolbar>
          <Button
            startIcon={<ChevronLeft />}
            sx={{ marginLeft: -1, marginRight: 2 }}
          >
            Leave
          </Button>
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
