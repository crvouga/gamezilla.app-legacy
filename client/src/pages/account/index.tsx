import { Home, Login, Logout } from "@mui/icons-material";
import {
  AppBar,
  IconButton,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Typography,
} from "@mui/material";
import React from "react";
import { Link } from "react-router-dom";

export const AccountPage = () => {
  return (
    <>
      <AppBar position="sticky">
        <Toolbar>
          <Link to="/">
            <IconButton edge="start" sx={{ marginRight: 2 }}>
              <Home />
            </IconButton>
          </Link>
          <Typography variant="h6">Account</Typography>
        </Toolbar>
      </AppBar>

      <List>
        <Link to="/sign-in">
          <ListItem button divider>
            <ListItemIcon>
              <Login />
            </ListItemIcon>
            <ListItemText primary="Sign In" />
          </ListItem>
        </Link>

        <Link to="/sign-out">
          <ListItem button divider>
            <ListItemIcon>
              <Logout />
            </ListItemIcon>
            <ListItemText primary="Sign Out" />
          </ListItem>
        </Link>
      </List>
    </>
  );
};
