import { ChevronRight, Delete, Logout } from "@mui/icons-material";
import { LoadingButton } from "@mui/lab";
import {
  DialogActions,
  Box,
  Button,
  Dialog,
  DialogTitle,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemSecondaryAction,
  ListItemText,
  Toolbar,
  Typography,
} from "@mui/material";
import { cmd, react } from "../Framework";
import React from "react";
import * as Session from "../Session";
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
  | { type: "Logout" }
  | { type: "DeleteProfile" }
  | { type: "UpdateProfile" };

export const update = (msg: Msg, model: Model): [Model, cmd.Cmd<Msg>] => {
  switch (msg.type) {
    case "Logout":
      return [model, Router.push("Logout")];

    case "UpdateProfile":
      return [model, cmd.none];

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
          <Typography align="center" sx={{ flex: 1 }} variant="h6">
            {username}
          </Typography>
        </Toolbar>
        <List>
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
