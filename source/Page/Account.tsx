import { ChevronRight, Delete, Edit, Logout } from "@mui/icons-material";
import {
  List,
  ListItemButton,
  ListItemIcon,
  ListItemSecondaryAction,
  ListItemText,
} from "@mui/material";
import React from "react";
import { cmd, react } from "../Framework";
import * as Router from "../Navigation";
import * as View from "../View";

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
      <View.Page>
        <View.Header
          left={
            <View.HeaderBackButton onClick={() => dispatch({ type: "Back" })} />
          }
          title={username}
        />

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
      </View.Page>
    );
