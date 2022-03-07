import { AppBar, Box, Button, List, Toolbar } from "@mui/material";
import React from "react";
import { Navigate, useNavigate, useParams } from "react-router-dom";
import { ListItemField } from "../../../../libs/components/ListItemField";
import { generateId } from "./game-session-data";

const GameSession = () => {
  const { gameSessionId } = useParams();

  if (gameSessionId) {
    return <SubscribeGameSession gameSessionId={gameSessionId} />;
  }

  return <Navigate to="/" replace />;
};

const SubscribeGameSession = ({ gameSessionId }: { gameSessionId: string }) => {
  const navigate = useNavigate();

  const onLeave = () => {
    navigate(-1);
  };

  return (
    <Box
      sx={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <AppBar>
        <Toolbar>
          <Button sx={{ marginLeft: -2 }} onClick={onLeave}>
            Leave
          </Button>
        </Toolbar>
      </AppBar>

      <List sx={{ flex: 1 }}>
        <ListItemField to="edit" label="Game" value="Tic Tac Toe" />
      </List>

      <Box sx={{ p: 2 }}>
        <Button fullWidth variant="contained">
          Start Game
        </Button>
      </Box>
    </Box>
  );
};

export default GameSession;
