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
import * as Routing from "../../app-routing-state";
import { useAppDispatch } from "../../app-store";

const Home = ({ profile }: { profile: { avatarUrl?: string } }) => {
  const dispatch = useAppDispatch();
  return (
    <>
      <AppBar>
        <Toolbar>
          <Typography sx={{ flex: 1 }} variant="h6">
            Home
          </Typography>

          <Avatar
            onClick={() => {
              dispatch(
                Routing.Actions.push({
                  type: "account",
                  child: {
                    type: "home",
                  },
                })
              );
            }}
            src={profile.avatarUrl}
          />
        </Toolbar>
      </AppBar>

      <List>
        <ListItemButton
          onClick={() => {
            dispatch(
              Routing.Actions.push({
                type: "account",
                child: {
                  type: "login",
                },
              })
            );
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
            dispatch(
              Routing.Actions.push({
                type: "profile",
                child: {
                  type: "home",
                },
              })
            );
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

export default Home;
