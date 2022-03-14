import { AppBar, Box, Button, Toolbar, Typography } from "@mui/material";
import React from "react";
import { useAppDispatch } from "../../store";
import { AppBarBackButton } from "../../ui";

const GameCreate = () => {
  const dispatch = useAppDispatch();
  return (
    <Box sx={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <AppBar>
        <Toolbar>
          <AppBarBackButton />

          <Typography sx={{ flex: 1 }} variant="h6">
            Create Game
          </Typography>
        </Toolbar>
      </AppBar>

      <Box sx={{ flex: 1, padding: 2 }}></Box>

      <Box sx={{ p: 2 }}>
        <Button
          fullWidth
          variant="contained"
          onClick={() => {
            dispatch({ type: "game", payload: { type: "create" } });
          }}
        >
          Create Game
        </Button>
      </Box>
    </Box>
  );
};

export default GameCreate;
