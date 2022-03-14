import { AppBar, Box, Button, Toolbar, Typography } from "@mui/material";
import React from "react";
import { useDispatch } from "react-redux";
import { AppBarBackButton } from "../../ui";
import * as Game from "./game-state";

const GameCreate = () => {
  const dispatch = useDispatch();
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
            dispatch(Game.actions.create());
          }}
        >
          Create Game
        </Button>
      </Box>
    </Box>
  );
};

export default GameCreate;
