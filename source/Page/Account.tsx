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
import * as Routes from "../Routes";
import * as View from "../View";

/* 


Model


*/

export type Model = {};

export const init: Model = {};

/* 


Update


*/

export type Msg =
  | { group: "Account"; type: "Back" }
  | { group: "Account"; type: "Logout" }
  | { group: "Account"; type: "DeleteProfile" }
  | { group: "Account"; type: "UpdateProfile" };

export const update = (msg: Msg, model: Model): [Model, cmd.Cmd<Msg>] => {
  switch (msg.type) {
    case "Back":
      return [model, Routes.replace({ type: "Home" })];

    case "Logout":
      return [model, Routes.push({ type: "Logout" })];

    case "UpdateProfile":
      return [model, Routes.push({ type: "ProfileUpdate" })];

    case "DeleteProfile":
      return [model, Routes.push({ type: "ProfileDelete" })];
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
            <View.HeaderBackButton
              onClick={() => dispatch({ group: "Account", type: "Back" })}
            />
          }
          title={username}
        />

        <List>
          <ListItemButton
            onClick={() =>
              dispatch({ group: "Account", type: "UpdateProfile" })
            }
          >
            <ListItemIcon>
              <Edit />
            </ListItemIcon>
            <ListItemText primary="Update Profile" />
            <ListItemSecondaryAction>
              <ChevronRight />
            </ListItemSecondaryAction>
          </ListItemButton>

          <ListItemButton
            onClick={() =>
              dispatch({ group: "Account", type: "DeleteProfile" })
            }
          >
            <ListItemIcon>
              <Delete />
            </ListItemIcon>
            <ListItemText primary="Delete Profile" />
            <ListItemSecondaryAction>
              <ChevronRight />
            </ListItemSecondaryAction>
          </ListItemButton>

          <ListItemButton
            onClick={() => dispatch({ group: "Account", type: "Logout" })}
          >
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
