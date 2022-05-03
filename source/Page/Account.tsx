import {
  Box,
  List,
  ListItemButton,
  ListItemText,
  Toolbar,
  Typography,
} from "@mui/material";
import { cmd, react } from "elm-ts";
import React from "react";

/* 


Model


*/

export type Model = { type: "Idle" } | { type: "ConfirmingLogout" };

export const init: Model = { type: "Idle" };

/* 


Update


*/

export type Msg =
  | { type: "ClickedLogout" }
  | { type: "ClickedDeleteProfile" }
  | { type: "ClickedUpdateProfile" };

export const update = (msg: Msg, model: Model): [Model, cmd.Cmd<Msg>] => {
  switch (msg.type) {
    case "ClickedLogout":
      if (model.type === "Idle") {
        return [{ type: "ConfirmingLogout" }, cmd.none];
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
  ({ username }: { username: string }, _model: Model): react.Html<Msg> =>
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
          <ListItemButton onClick={() => dispatch({ type: "ClickedLogout" })}>
            <ListItemText primary="Logout" />
          </ListItemButton>
        </List>
      </Box>
    );
