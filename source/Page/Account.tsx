import { ChevronRight, Logout } from "@mui/icons-material";
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
import { cmd, react } from "elm-ts";
import React from "react";
import * as Session from "../Session";

/* 


Model


*/

export type Model =
  | { type: "Idle" }
  | { type: "ConfirmingLogout" }
  | { type: "LoggingOut" };

export const init: Model = { type: "Idle" };

/* 


Update


*/

export type Msg =
  | { type: "ClickedLogout" }
  | { type: "ClickedLogoutCancel" }
  | { type: "ClickedLogoutConfirmed" }
  | { type: "ClickedDeleteProfile" }
  | { type: "ClickedUpdateProfile" };

export const update = (msg: Msg, model: Model): [Model, cmd.Cmd<Msg>] => {
  switch (msg.type) {
    case "ClickedLogout":
      if (model.type === "Idle") {
        return [{ type: "ConfirmingLogout" }, cmd.none];
      }

      return [model, cmd.none];

    case "ClickedLogoutCancel":
      if (model.type === "ConfirmingLogout") {
        return [{ type: "Idle" }, cmd.none];
      }

      return [model, cmd.none];

    case "ClickedLogoutConfirmed":
      if (model.type === "ConfirmingLogout") {
        return [{ type: "LoggingOut" }, Session.logout()];
      }

      return [model, cmd.none];

    case "ClickedUpdateProfile":
      return [model, cmd.none];

    case "ClickedDeleteProfile":
      return [model, cmd.none];
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
          <Dialog
            open={
              model.type === "ConfirmingLogout" || model.type === "LoggingOut"
            }
            onClose={() => dispatch({ type: "ClickedLogoutCancel" })}
          >
            <DialogTitle>Logout of Gamezilla?</DialogTitle>
            <DialogActions>
              <Button
                disabled={model.type === "LoggingOut"}
                onClick={() => dispatch({ type: "ClickedLogoutCancel" })}
              >
                Cancel
              </Button>
              <LoadingButton
                loading={model.type === "LoggingOut"}
                onClick={() => dispatch({ type: "ClickedLogoutConfirmed" })}
              >
                Logout
              </LoadingButton>
            </DialogActions>
          </Dialog>
          <ListItemButton onClick={() => dispatch({ type: "ClickedLogout" })}>
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
