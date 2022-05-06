import { Box } from "@mui/material";
import React from "react";
import { cmd, react } from "../Framework";
import * as Routing from "../Routing";
import * as View from "../View";

/* 


Model


*/

export type Model = {};

export const init: Model = {};

/* 


Update


*/

export type Msg = { group: "ConnectFour"; type: "Back" };

export const update = (msg: Msg, model: Model): [Model, cmd.Cmd<Msg>] => {
  switch (msg.type) {
    case "Back":
      return [model, Routing.Routes.replace("Home")];
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
        <View.Header
          left={
            <View.HeaderBackButton
              onClick={() => dispatch({ group: "ConnectFour", type: "Back" })}
            />
          }
          title="Connect Four"
        />
      </Box>
    );
