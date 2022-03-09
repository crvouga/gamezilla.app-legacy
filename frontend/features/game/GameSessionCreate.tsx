import {
  Alert,
  AppBar,
  Box,
  Button,
  Snackbar,
  Toolbar,
  Typography,
} from "@mui/material";
import { AppBarBackButton } from "../../ui";
import React, { useState } from "react";
import { create, IGameSessionCreateResult } from "./game-session-data-access";

export const GameSessionCreate = (_props: {
  profile: { avatarUrl?: string };
}) => {
  const [result, setResult] = useState<
    { type: "idle" } | IGameSessionCreateResult
  >({ type: "idle" });

  const onCreateGame = async () => {
    const result = await create();
    setResult(result);
  };

  const error =
    result.type === "error" && result.errors.length > 0
      ? result.errors[0]
      : { message: "Something went wrong an unknown reason" };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <Snackbar
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
        open={result.type === "error"}
        onClose={() => setResult({ type: "idle" })}
        autoHideDuration={3000}
      >
        <Alert key={error.message} severity="error">
          {error.message}
        </Alert>
      </Snackbar>

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
