import React from "react";
import { Avatar, Box, Toolbar, Typography } from "@mui/material";
import { cmd, react } from "elm-ts";
import { LoadingButton } from "@mui/lab";
import * as Routes from "../Router";

/* 


Model


*/

export type Model = {};

export const init: Model = {};

/* 


Update


*/

export type Msg = { type: "ClickedAvatar" };

export const update = (msg: Msg, model: Model): [Model, cmd.Cmd<Msg>] => {
  switch (msg.type) {
    case "ClickedAvatar":
      return [model, Routes.push("Account")];
  }
};

/* 


View


*/

export const view =
  ({ avatarUrl }: { avatarUrl: string }, _model: Model): react.Html<Msg> =>
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
          <Typography sx={{ flex: 1 }} variant="h6">
            Gamezilla
          </Typography>

          <Avatar
            onClick={() => dispatch({ type: "ClickedAvatar" })}
            src={avatarUrl}
          />
        </Toolbar>
        <Box sx={{ p: 2 }}>
          <LoadingButton fullWidth>Delete Profile</LoadingButton>
        </Box>
      </Box>
    );
