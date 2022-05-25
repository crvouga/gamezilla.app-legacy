import { Box } from "@mui/material";
import { cmd, navigation, react } from "Framework";
import { Cmd } from "Framework/Cmd";
import * as React from "react";
import * as View from "View";
import * as Route from "Route";

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
  | { type: "UserClickedSendMessageButton" };

export const update = (msg: Msg, model: Model): [Model, Cmd<Msg>] => {
  switch (msg.type) {
    case "UserClickedBackButton":
      return [model, navigation.back()];

    case "UserClickedSendMessageButton":
      return [model, navigation.push(Route.encode({ type: "ChatNew" }))];
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
  (model: Model): react.Html<Msg> =>
  (dispatch) =>
    (
      <View.Page>
        <View.Header
          left={
            <View.HeaderBackButton
              onClick={() => dispatch({ type: "UserClickedBackButton" })}
            />
          }
          title="Chat"
        />
        <Box sx={{ p: 2 }}>
          <View.Button
            fullWidth
            variant="contained"
            onClick={() => dispatch({ type: "UserClickedSendMessageButton" })}
          >
            Send Message
          </View.Button>
        </Box>
      </View.Page>
    );
