import { ChevronRight, Delete, Edit, Logout } from "@mui/icons-material";
import {
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogTitle,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemSecondaryAction,
  ListItemText,
  Typography,
} from "@mui/material";
import React from "react";
import { cmd, react } from "Framework";
import * as Profile from "../Profile";
import * as Routes from "Routes";
import * as View from "../View";
import { pipe } from "fp-ts/lib/function";
import { attempt } from "Framework/Task";
import { either } from "fp-ts";

// ███╗   ███╗ ██████╗ ██████╗ ███████╗██╗
// ████╗ ████║██╔═══██╗██╔══██╗██╔════╝██║
// ██╔████╔██║██║   ██║██║  ██║█████╗  ██║
// ██║╚██╔╝██║██║   ██║██║  ██║██╔══╝  ██║
// ██║ ╚═╝ ██║╚██████╔╝██████╔╝███████╗███████╗
// ╚═╝     ╚═╝ ╚═════╝ ╚═════╝ ╚══════╝╚══════╝

export type Model =
  | { type: "Idle" }
  | { type: "ComfirmDeleteProfile" }
  | { type: "DeletingProfile" };

export const init: Model = { type: "Idle" };

// ██╗   ██╗██████╗ ██████╗  █████╗ ████████╗███████╗
// ██║   ██║██╔══██╗██╔══██╗██╔══██╗╚══██╔══╝██╔════╝
// ██║   ██║██████╔╝██║  ██║███████║   ██║   █████╗
// ██║   ██║██╔═══╝ ██║  ██║██╔══██║   ██║   ██╔══╝
// ╚██████╔╝██║     ██████╔╝██║  ██║   ██║   ███████╗
//  ╚═════╝ ╚═╝     ╚═════╝ ╚═╝  ╚═╝   ╚═╝   ╚══════╝

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
      return [model, Routes.replace({ type: "Home" })];

    case "Logout":
      return [model, Routes.push({ type: "Logout" })];

    case "UpdateProfile":
      return [model, Routes.push({ type: "ProfileUpdate" })];

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

// ██╗   ██╗██╗███████╗██╗    ██╗
// ██║   ██║██║██╔════╝██║    ██║
// ██║   ██║██║█████╗  ██║ █╗ ██║
// ╚██╗ ██╔╝██║██╔══╝  ██║███╗██║
//  ╚████╔╝ ██║███████╗╚███╔███╔╝
//   ╚═══╝  ╚═╝╚══════╝ ╚══╝╚══╝

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
