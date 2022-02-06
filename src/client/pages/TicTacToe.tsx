import { Add, ChevronRight, Search } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import {
  AppBar,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemSecondaryAction,
  ListItemText,
  Toolbar,
  Typography,
} from "@mui/material";
import React from "react";
import BackButton from "../components/BackButton";

export const TicTacToe = () => {
  const navigate = useNavigate();
  return (
    <>
      <AppBar>
        <Toolbar>
          <BackButton />
          <Typography variant="h6">Tic Tac Toe</Typography>
        </Toolbar>
      </AppBar>

      <List>
        <ListItemButton
          onClick={() => {
            const gameId = String(Math.floor(Math.random() * 1000));
            navigate(`/tic-tac-toe/game/${gameId}`);
          }}
        >
          <ListItemIcon>
            <Add />
          </ListItemIcon>
          <ListItemText primary="Create Game" />
          <ListItemSecondaryAction>
            <ChevronRight />
          </ListItemSecondaryAction>
        </ListItemButton>

        <ListItemButton>
          <ListItemIcon>
            <Search />
          </ListItemIcon>
          <ListItemText primary="Join Game" />
          <ListItemSecondaryAction>
            <ChevronRight />
          </ListItemSecondaryAction>
        </ListItemButton>
      </List>
    </>
  );
};

export default TicTacToe;
