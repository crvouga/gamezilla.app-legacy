import { Box, Toolbar, Typography } from "@mui/material";
import React from "react";
import { cmd, react } from "../Framework";
import * as Routes from "../Router";

/* 


Model


*/

export type Model = {};

export const init: Model = {};

/* 


Update


*/

export type Msg = { type: "Back" };

export const update = (msg: Msg, model: Model): [Model, cmd.Cmd<Msg>] => {
  switch (msg.type) {
    case "Back":
      return [model, Routes.replace("Home")];
  }
};

/* 


View


*/

export const view =
  (_model: Model): react.Html<Msg> =>
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
            Tic Tac Toe
          </Typography>
        </Toolbar>
      </Box>
    );
