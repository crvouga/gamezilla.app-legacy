import { AppBar, Button, List, Toolbar } from "@mui/material";
import React from "react";
import { useParams } from "react-router-dom";

export const GameSession = () => {
  const { gameSessionId } = useParams();

  return (
    <>
      <AppBar>
        <Toolbar>
          <Button>Leave</Button>
        </Toolbar>
      </AppBar>
      <List>{gameSessionId}</List>
    </>
  );
};
