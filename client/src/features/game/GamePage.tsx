import { ArrowBack, PersonAdd } from "@mui/icons-material";
import {
  AppBar,
  IconButton,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Toolbar,
} from "@mui/material";
import React from "react";
import { Link, useParams } from "react-router-dom";

export const GamePage = () => {
  const params = useParams<"id">();

  return (
    <>
      <AppBar position="sticky">
        <Toolbar>
          <Link to="/">
            <IconButton edge="start">
              <ArrowBack />
            </IconButton>
          </Link>
        </Toolbar>
      </AppBar>

      <List>
        <Link to={`/game/${params.id}/invite`}>
          <ListItem divider button>
            <ListItemIcon>
              <PersonAdd />
            </ListItemIcon>
            <ListItemText primary="Invite" />
          </ListItem>
        </Link>
      </List>
      {params.id}
    </>
  );
};
