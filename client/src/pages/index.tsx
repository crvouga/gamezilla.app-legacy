import { ChevronRight, Gamepad } from "@mui/icons-material";
import {
  AppBar,
  Avatar,
  Container,
  List,
  ListItem,
  ListItemIcon,
  ListItemSecondaryAction,
  ListItemText,
  Toolbar,
  Typography,
} from "@mui/material";
import React from "react";
import { Link } from "react-router-dom";

export const HomePage = () => {
  return (
    <>
      <AppBar position="sticky">
        <Toolbar>
          <Typography sx={{ flex: 1 }} variant="h6">
            Home
          </Typography>
          <Link to="/account">
            <Avatar />
          </Link>
        </Toolbar>
      </AppBar>

      <Container disableGutters>
        <List>
          <Link to="/game/create">
            <ListItem button divider>
              <ListItemIcon>
                <Gamepad />
              </ListItemIcon>
              <ListItemText primary="Create Game" />
              <ListItemSecondaryAction>
                <ChevronRight />
              </ListItemSecondaryAction>
            </ListItem>
          </Link>
        </List>
      </Container>
    </>
  );
};
