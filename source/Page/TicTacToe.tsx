import React from "react";
import { cmd, react } from "../Framework";
import * as Routes from "../Navigation";
import * as View from "../View";

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
      <View.Page>
        <View.Header
          left={
            <View.HeaderBackButton onClick={() => dispatch({ type: "Back" })} />
          }
          title="Tic Tac Toe"
        />
      </View.Page>
    );
