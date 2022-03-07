import { AppBarBackButton } from "@libs/components";
import { AppBar, Box, Button, Toolbar, Typography } from "@mui/material";
import React from "react";
import { useNavigate } from "react-router-dom";
import { generateId } from "./game-session-data";
import { _create } from "./game-session-data-access";

export const GameSessionCreate = ({
  profile,
}: {
  profile: { avatarUrl?: string };
}) => {
  const navigate = useNavigate();

  const onCreateGame = () => {
    _create();

    // navigate(`/game-session/${generateId()}`, { replace: true });
  };

  return (
    <>
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
    </>
  );
};
