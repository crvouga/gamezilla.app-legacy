import { ChevronRight, Games, Logout, Person } from "@mui/icons-material";
import {
  List,
  ListItemButton,
  ListItemIcon,
  ListItemSecondaryAction,
  ListItemText,
} from "@mui/material";
import React from "react";
import { AppBar } from "../../ui-components";

export const HomeView = ({
  navigate,
}: {
  navigate: (
    route:
      | {
          type: "profile";
        }
      | {
          type: "sign-out";
        }
      | {
          type: "game";
        }
  ) => void;
}) => {
  return (
    <>
      <AppBar title={"Home"} />

      <List>
        <ListItemButton
          onClick={() => {
            navigate({ type: "game" });
          }}
        >
          <ListItemIcon>
            <Games />
          </ListItemIcon>
          <ListItemText primary="Game" />
          <ListItemSecondaryAction>
            <ChevronRight />
          </ListItemSecondaryAction>
        </ListItemButton>
        <ListItemButton
          onClick={() => {
            navigate({ type: "profile" });
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
        <ListItemButton
          onClick={() => {
            navigate({ type: "sign-out" });
          }}
        >
          <ListItemIcon>
            <Logout />
          </ListItemIcon>
          <ListItemText primary="Sign Out" />
          <ListItemSecondaryAction>
            <ChevronRight />
          </ListItemSecondaryAction>
        </ListItemButton>
      </List>
    </>
  );
};
