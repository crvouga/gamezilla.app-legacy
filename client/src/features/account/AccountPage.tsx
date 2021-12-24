import { ArrowBack, ChevronRight, Logout } from "@mui/icons-material";
import {
  AppBar,
  Avatar,
  IconButton,
  List,
  ListItem,
  ListItemAvatar,
  ListItemIcon,
  ListItemSecondaryAction,
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
              <ArrowBack />
            </IconButton>
          </Link>
          <Typography variant="h6">Account</Typography>
        </Toolbar>
      </AppBar>

      <List>
        <Link to="/profile/edit">
          <ListItem button divider>
            <ListItemAvatar>
              <Avatar />
            </ListItemAvatar>
            <ListItemText primary="Edit Profile" />
            <ListItemSecondaryAction>
              <ChevronRight />
            </ListItemSecondaryAction>
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
