import { ArrowBack, ChevronRight, Logout } from "@mui/icons-material";
import {
  AppBar,
  IconButton,
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
import { LoginSessionAvatar } from "src/components/LoginSessionAvatar";

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
            <ListItemIcon>
              <LoginSessionAvatar sx={{ width: "24px", height: "24px" }} />
            </ListItemIcon>
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
