import { cmd, navigation, react } from "Framework";
import React from "react";
import * as View from "../View";

//
//
//
//
// Model
//
//
//
//

export type Model = {};

export const init: Model = {};

//
//
//
//
// Update
//
//
//
//

export type Msg = { group: "Chess"; type: "Back" };

export const update = (msg: Msg, model: Model): [Model, cmd.Cmd<Msg>] => {
  switch (msg.type) {
    case "Back":
      return [model, navigation.back()];
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
  (_: Model): react.Html<Msg> =>
  (dispatch) =>
    (
      <View.Page>
        <View.Header
          left={
            <View.HeaderBackButton
              onClick={() => dispatch({ group: "Chess", type: "Back" })}
            />
          }
          title="Chess"
        />
      </View.Page>
    );
