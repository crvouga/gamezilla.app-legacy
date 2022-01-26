import {
  Typography,
  AppBar,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemSecondaryAction,
  ListItemText,
  Toolbar,
  Avatar,
} from "@mui/material";
import React from "react";
import { Link } from "react-location";
import { Icons } from "../components";

export const HomePage = ({ profile }: { profile: { avatarUrl?: string } }) => {
  return (
    <>
      <AppBar>
        <Toolbar>
          <Typography sx={{ flex: 1 }} variant="h6">
            Home
          </Typography>
          <Avatar src={profile.avatarUrl} />
        </Toolbar>
      </AppBar>

      <List>
        <Link to="/tic-tac-toe">
          <ListItemButton>
            <ListItemText primary="Tic Tac Toe" />
          </ListItemButton>
        </Link>

        <Link to="/profile/edit">
          <ListItemButton>
            <ListItemIcon>
              <Icons.Edit />
            </ListItemIcon>
            <ListItemText primary="Edit Profile" />
            <ListItemSecondaryAction>
              <Icons.ChevronRight />
            </ListItemSecondaryAction>
          </ListItemButton>
        </Link>

        <Link to="/logout">
          <ListItemButton>
            <ListItemIcon>
              <Icons.Logout />
            </ListItemIcon>
            <ListItemText primary="Logout" />
          </ListItemButton>
        </Link>
      </List>
    </>
  );
};
