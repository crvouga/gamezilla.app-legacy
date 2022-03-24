import { Add, ChevronLeft, ChevronRight, Search } from "@mui/icons-material";
import {
  IconButton,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemSecondaryAction,
  ListItemText,
} from "@mui/material";
import React from "react";
import { AppBar } from "../../ui-components";

export const GameView = ({
  navigate,
}: {
  navigate: (action: { type: "back" }) => void;
}) => {
  return (
    <>
      <AppBar
        start={[
          <IconButton
            sx={{ marginLeft: -1 }}
            onClick={() => {
              navigate({ type: "back" });
            }}
          >
            <ChevronLeft />
          </IconButton>,
        ]}
        title="Game"
      />

      <List>
        <ListItemButton>
          <ListItemIcon>
            <Add />
          </ListItemIcon>
          <ListItemText primary="Create" />
          <ListItemSecondaryAction>
            <ChevronRight />
          </ListItemSecondaryAction>
        </ListItemButton>

        <ListItemButton>
          <ListItemIcon>
            <Search />
          </ListItemIcon>
          <ListItemText primary="Join" />
          <ListItemSecondaryAction>
            <ChevronRight />
          </ListItemSecondaryAction>
        </ListItemButton>
      </List>
    </>
  );
};
