import { ChevronRight, DeleteForever, Edit, Logout } from "@mui/icons-material";
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
import { Link } from "react-router-dom";
import { AppBarBackButton } from "../../ui";

const Account = () => {
  return (
    <>
      <AppBar>
        <Toolbar>
          <AppBarBackButton />
          <Typography variant="h6">Account</Typography>
        </Toolbar>
      </AppBar>

      <List>
        <Link to="/profile/update">
          <ListItemButton>
            <ListItemIcon>
              <Edit />
            </ListItemIcon>
            <ListItemText primary="Edit Profile" />
            <ListItemSecondaryAction>
              <ChevronRight />
            </ListItemSecondaryAction>
          </ListItemButton>
        </Link>

        <Link to="/profile/delete">
          <ListItemButton>
            <ListItemIcon>
              <DeleteForever />
            </ListItemIcon>
            <ListItemText primary="Delete Profile" />
          </ListItemButton>
        </Link>

        <Link to="logout">
          <ListItemButton>
            <ListItemIcon>
              <Logout />
            </ListItemIcon>
            <ListItemText primary="Logout" />
          </ListItemButton>
        </Link>
      </List>
    </>
  );
};

export default Account;
