import { ChevronRight, Gamepad } from "@mui/icons-material";
import {
  AppBar,
  Container,
  List,
  ListItem,
  ListItemIcon,
  ListItemSecondaryAction,
  ListItemText,
  Toolbar,
  Typography,
} from "@mui/material";
import { Link } from "react-router-dom";
import React from "react";

export const HomePage = () => {
  return (
    <>
      <AppBar position="sticky">
        <Toolbar>
          <Typography variant="h6">Home</Typography>
        </Toolbar>
      </AppBar>

      <Container disableGutters>
        <List>
          <Link to="/game">
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
