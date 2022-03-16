import { AppBar, Box, Button, Toolbar, Typography } from "@mui/material";
import React from "react";
import { AppBarBackButton } from "../../ui";
import * as Game from "./game-state";

const GameJoin = ({
  dispatch,
}: {
  dispatch: (action: Game.IAction) => void;
}) => {
  return (
    <Box sx={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <AppBar>
        <Toolbar>
          <AppBarBackButton />

          <Typography sx={{ flex: 1 }} variant="h6">
            Join Game
          </Typography>
        </Toolbar>
      </AppBar>

      <Box sx={{ flex: 1, padding: 2 }}></Box>

      <Box sx={{ p: 2 }}>
        <Button
          fullWidth
          variant="contained"
          onClick={() => {
            dispatch({
              namespace: "game",
              type: Game.ActionType.Join,
            });
          }}
        >
          Join Game
        </Button>
      </Box>
    </Box>
  );
};

export default GameJoin;
