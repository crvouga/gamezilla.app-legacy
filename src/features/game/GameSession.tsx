import { Add, ChevronLeft, ChevronRight, Search } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import {
  AppBar,
  IconButton,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemSecondaryAction,
  ListItemText,
  Toolbar,
  Typography,
} from "@mui/material";
import React from "react";

export const GameSessionCreate = () => {
  return <>create game session</>;
};

export const GameSession = () => {
  const navigate = useNavigate();

  return (
    <>
      <List>
        <ListItemButton
          onClick={() => {
            const gameId = String(Math.floor(Math.random() * 1000));
            navigate(`/tic-tac-toe/session/${gameId}`);
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
