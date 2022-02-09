import { AppBar, Box, Button, List, Toolbar } from "@mui/material";
import React from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ListItemField } from "../../components/ListItemField";

export const GameSession = () => {
  const { gameSessionId } = useParams();

  const navigate = useNavigate();

  const onLeave = () => {
    navigate(-1);
  };

  return (
    <>
      <AppBar>
        <Toolbar>
          <Button onClick={onLeave}>Leave</Button>
        </Toolbar>
      </AppBar>
      <List>
        <ListItemField to="edit" label="Game" value="Tic Tac Toe" />
      </List>
      <Box sx={{ p: 2 }}>
        <Button fullWidth variant="contained">
          Start Game
        </Button>
      </Box>
    </>
  );
};
