import { ChevronRight, Delete, Edit, Logout } from "@mui/icons-material";
import {
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemSecondaryAction,
  ListItemText,
  Typography,
} from "@mui/material";
import React from "react";
import { cmd, react } from "../Framework";
import * as Routes from "../Routes";
import * as View from "../View";
import * as Profile from "../Profile";

//
//
//
//
// Model
//
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
//
// Update
//
//
//
//

export type Msg =
  | { group: "Account"; type: "Back" }
  | { group: "Account"; type: "Logout" }
  | { group: "Account"; type: "DeleteProfile" }
  | { group: "Account"; type: "CancelledDeleteProfile" }
  | { group: "Account"; type: "ConfirmedDeleteProfile" }
  | { group: "Account"; type: "DeleteProfileSucceeded" }
  | { group: "Account"; type: "DeleteProfileFailed" }
  | { group: "Account"; type: "UpdateProfile" };

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
        Profile.remove<Msg>({
          userId,
          onSuccess: () => ({
            group: "Account",
            type: "DeleteProfileSucceeded",
          }),
          onFailure: () => ({ group: "Account", type: "DeleteProfileFailed" }),
        }),
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
//
// View
//
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

          <Dialog open={model.type === "DeletingProfile"}>
            <Box
              sx={{
                paddingX: 4,
                paddingY: 2,
                // flexDirection: "column",
                display: "flex",
                alignItems: "center",
              }}
            >
              <Typography sx={{ mr: 2 }}>Deleting profile...</Typography>
              <CircularProgress sx={{ mb: 1 }} />
            </Box>
          </Dialog>

          <Dialog
            open={model.type === "ComfirmDeleteProfile"}
            onClose={() =>
              dispatch({ type: "CancelledDeleteProfile", group: "Account" })
            }
          >
            <DialogTitle>Delete your profile forever?</DialogTitle>
            <DialogActions>
              <Button
                onClick={() =>
                  dispatch({
                    type: "CancelledDeleteProfile",
                    group: "Account",
                  })
                }
              >
                Cancel
              </Button>
              <Button
                onClick={() =>
                  dispatch({ type: "ConfirmedDeleteProfile", group: "Account" })
                }
              >
                Delete
              </Button>
            </DialogActions>
          </Dialog>

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
