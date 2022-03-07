import { AppBarBackButton } from "@libs/components";
import { AppBar, Box, Button, Stack, Toolbar, Typography } from "@mui/material";
import React from "react";
import { create } from "./game-session-data-access";

export const GameSessionCreate = ({
  profile,
}: {
  profile: { avatarUrl?: string };
}) => {
  const onCreateGame = async () => {
    await create();
  };

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

      <Box sx={{ flex: 1 }}></Box>

      <Box sx={{ p: 2 }}>
        <Button fullWidth variant="contained" onClick={onCreateGame}>
          Create Game
        </Button>
      </Box>
    </Box>
  );
};
