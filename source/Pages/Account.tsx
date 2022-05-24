import { ChevronRight, Delete, Edit, Logout } from "@mui/icons-material";
import {
  List,
  ListItemButton,
  ListItemIcon,
  ListItemSecondaryAction,
  ListItemText,
} from "@mui/material";
import { either } from "fp-ts";
import { pipe } from "fp-ts/lib/function";
import { cmd, navigation, react } from "Framework";
import { attempt } from "Framework/Task";
import React from "react";
import * as Route from "Route";
import * as Profile from "../Profile";
import * as View from "../View";

//
//
//
// Model
//
//
//

export type Model = {};

export const init: Model = {};

//
//
//
// Update
//
//
//

export type Msg =
  | { type: "UserClickedBackButton" }
  | { type: "UserClickedLogoutLink" }
  | { type: "UserClickedDeleteProfileLink" }
  | { type: "UserClickedUpdateProfileLink" };

export const update = (
  { userId }: { userId: string },
  msg: Msg,
  model: Model
): [Model, cmd.Cmd<Msg>] => {
  switch (msg.type) {
    case "UserClickedBackButton":
      return [model, navigation.back()];

    case "UserClickedLogoutLink":
      return [model, navigation.push(Route.encode({ type: "Logout" }))];

    case "UserClickedUpdateProfileLink":
      return [model, navigation.push(Route.encode({ type: "ProfileUpdate" }))];

    case "UserClickedDeleteProfileLink":
      return [model, navigation.push(Route.encode({ type: "ProfileDelete" }))];
  }
};

//
//
//
// View
//
//
//

export const view =
  ({ username }: { username: string }, model: Model): react.Html<Msg> =>
  (dispatch) =>
    (
      <View.Page>
        <View.Header
          left={
            <View.HeaderBackButton
              onClick={() => dispatch({ type: "UserClickedBackButton" })}
            />
          }
          title={username}
        />

        <List>
          <ListItemButton
            onClick={() => dispatch({ type: "UserClickedUpdateProfileLink" })}
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
            onClick={() => dispatch({ type: "UserClickedDeleteProfileLink" })}
          >
            <ListItemIcon>
              <Delete />
            </ListItemIcon>
            <ListItemText primary="Delete Profile" />
          </ListItemButton>

          <ListItemButton
            onClick={() => dispatch({ type: "UserClickedLogoutLink" })}
          >
            <ListItemIcon>
              <Logout />
            </ListItemIcon>
            <ListItemText primary="Logout" />
          </ListItemButton>
        </List>
      </View.Page>
    );
