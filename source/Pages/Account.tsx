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
import * as Routes from "Routes";
import * as Profile from "../Profile";
import * as View from "../View";

//
//
//
// Model
//
//
//

export type Model =
  | { type: "Idle" }
  | { type: "ComfirmDeleteProfile" }
  | { type: "DeletingProfile" };

export const init: Model = { type: "Idle" };

//
//
//
// Update
//
//
//

export type Msg =
  | { type: "Back" }
  | { type: "Logout" }
  | { type: "DeleteProfile" }
  | { type: "CancelledDeleteProfile" }
  | { type: "ConfirmedDeleteProfile" }
  | { type: "DeleteProfileSucceeded" }
  | { type: "DeleteProfileFailed" }
  | { type: "UpdateProfile" };

export const update = (
  { userId }: { userId: string },
  msg: Msg,
  model: Model
): [Model, cmd.Cmd<Msg>] => {
  switch (msg.type) {
    case "Back":
      return [model, navigation.back()];

    case "Logout":
      return [model, navigation.push(Routes.encode({ type: "Logout" }))];

    case "UpdateProfile":
      return [model, navigation.push(Routes.encode({ type: "ProfileUpdate" }))];

    case "DeleteProfile":
      return [{ ...model, type: "ComfirmDeleteProfile" }, cmd.none];

    case "CancelledDeleteProfile":
      return [{ ...model, type: "Idle" }, cmd.none];

    case "ConfirmedDeleteProfile":
      return [
        { ...model, type: "DeletingProfile" },
        pipe(
          Profile.deleteForever({
            userId,
          }),
          attempt(
            either.fold<{}, {}, Msg>(
              () => ({ type: "DeleteProfileFailed" }),
              () => ({ type: "DeleteProfileSucceeded" })
            )
          )
        ),
      ];

    case "DeleteProfileFailed":
      return [model, cmd.none];

    case "DeleteProfileSucceeded":
      return [model, cmd.none];
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
          </ListItemButton>

          <View.LoadingDialog
            open={model.type === "DeletingProfile"}
            title="Deleting profile..."
          />

          <View.ConformationDialog
            open={model.type === "ComfirmDeleteProfile"}
            onCancel={() => dispatch({ type: "CancelledDeleteProfile" })}
            title="Delete profile forever?"
            onConfirm={() => dispatch({ type: "ConfirmedDeleteProfile" })}
            confirmTitle="Delete"
          />

          <ListItemButton onClick={() => dispatch({ type: "Logout" })}>
            <ListItemIcon>
              <Logout />
            </ListItemIcon>
            <ListItemText primary="Logout" />
          </ListItemButton>
        </List>
      </View.Page>
    );
