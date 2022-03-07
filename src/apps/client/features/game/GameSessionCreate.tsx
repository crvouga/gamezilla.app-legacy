import { Add, ChevronRight, Search } from "@mui/icons-material";
import {
  AppBar,
  Avatar,
  Box,
  Button,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemSecondaryAction,
  ListItemText,
  Toolbar,
  Typography,
} from "@mui/material";
import { generateId } from "./game-session-data";
import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { AppBarBackButton } from "@libs/components";

export const GameSessionCreate = ({
  profile,
}: {
  profile: { avatarUrl?: string };
}) => {
  const navigate = useNavigate();

  const onCreateGame = () => {
    navigate(`/game-session/${generateId()}`, { replace: true });
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
