import {
  ChevronLeft,
  ChevronRight,
  Delete,
  Edit,
  Logout,
} from "@mui/icons-material";
import {
  Box,
  IconButton,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemSecondaryAction,
  ListItemText,
  Toolbar,
  Typography,
} from "@mui/material";
import React from "react";
import { cmd, react } from "../Framework";
import * as Router from "../Router";

/* 


Model


*/

export type Model = { type: "Idle" };

export const init: Model = { type: "Idle" };

/* 


Update


*/

export type Msg =
  | { type: "Back" }
  | { type: "Logout" }
  | { type: "DeleteProfile" }
  | { type: "UpdateProfile" };

export const update = (msg: Msg, model: Model): [Model, cmd.Cmd<Msg>] => {
  switch (msg.type) {
    case "Back":
      return [model, Router.replace("Home")];

    case "Logout":
      return [model, Router.push("Logout")];

    case "UpdateProfile":
      return [model, Router.push("ProfileUpdate")];

    case "DeleteProfile":
      return [model, Router.push("ProfileDelete")];
  }
};

/* 


View


*/

export const view =
  ({ username }: { username: string }, model: Model): react.Html<Msg> =>
  (dispatch) =>
    (
      <Box
        sx={{
          position: "fixed",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <Toolbar>
          <Box sx={{ flex: 1 }}>
            <IconButton edge="start" onClick={() => dispatch({ type: "Back" })}>
              <ChevronLeft />
            </IconButton>
          </Box>

          <Typography align="center" sx={{ flex: 2 }} variant="h6">
            {username}
          </Typography>

          <Box sx={{ flex: 1 }} />
        </Toolbar>
        <List>
          <ListItemButton onClick={() => dispatch({ type: "UpdateProfile" })}>
            <ListItemIcon>
              <Edit />
            </ListItemIcon>
            <ListItemText primary="Update Profile" />
            <ListItemSecondaryAction>
              <ChevronRight />
            </ListItemSecondaryAction>
          </ListItemButton>

          <ListItemButton onClick={() => dispatch({ type: "DeleteProfile" })}>
            <ListItemIcon>
              <Delete />
            </ListItemIcon>
            <ListItemText primary="Delete Profile" />
            <ListItemSecondaryAction>
              <ChevronRight />
            </ListItemSecondaryAction>
          </ListItemButton>

          <ListItemButton onClick={() => dispatch({ type: "Logout" })}>
            <ListItemIcon>
              <Logout />
            </ListItemIcon>
            <ListItemText primary="Logout" />
            <ListItemSecondaryAction>
              <ChevronRight />
            </ListItemSecondaryAction>
          </ListItemButton>
        </List>
      </Box>
    );
