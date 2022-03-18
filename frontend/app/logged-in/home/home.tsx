import { ChevronRight, Games, Person } from "@mui/icons-material";
import {
  AppBar,
  Avatar,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemSecondaryAction,
  ListItemText,
  Toolbar,
  Typography,
} from "@mui/material";
import React from "react";

export const view = ({ profile }: { profile: { avatarUrl?: string } }) => {
  return (
    <>
      <AppBar>
        <Toolbar>
          <Typography sx={{ flex: 1 }} variant="h6">
            Home
          </Typography>

          <Avatar onClick={() => {}} src={profile.avatarUrl} />
        </Toolbar>
      </AppBar>

      <List>
        <ListItemButton
          onClick={() => {
            // dispatch(
            //   Routing.actions.push({
            //     type: "account",
            //     child: {
            //       type: "login",
            //     },
            //   })
            // );
          }}
        >
          <ListItemIcon>
            <Games />
          </ListItemIcon>
          <ListItemText primary="Play Game" />
          <ListItemSecondaryAction>
            <ChevronRight />
          </ListItemSecondaryAction>
        </ListItemButton>

        <ListItemButton
          onClick={() => {
            // dispatch(
            //   Routing.actions.push({
            //     type: "profile",
            //     child: {
            //       type: "home",
            //     },
            //   })
            // );
          }}
        >
          <ListItemIcon>
            <Person />
          </ListItemIcon>
          <ListItemText primary="Profile" />
          <ListItemSecondaryAction>
            <ChevronRight />
          </ListItemSecondaryAction>
        </ListItemButton>
      </List>
    </>
  );
};
