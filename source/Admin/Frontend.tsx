// import "@alenaksu/json-viewer";
import { useEffect, useRef } from "react";
// import { JSONTree } from "react-json-tree";
import * as Route from "../Route";
import * as UI from "../UI";
import { Cmd, RemoteData, Sub } from "../Core";
import { FrontendModel, ToFrontend } from "./Types";

//
//
//
// Model
//
//
//

export type Model = FrontendModel;

export const init: Model = {
  backendModel: RemoteData.Loading,
};

//
//
//
// Update
//
//
//

type Msg = ["ClickedBack"];

export const update = (msg: Msg, model: Model): [Model, Cmd.Cmd<Msg>] => {
  switch (msg[0]) {
    case "ClickedBack": {
      return [model, Route.back];
    }
  }
};

export const updateFromBackend = (
  msg: ToFrontend,
  model: Model,
): [Model, Cmd.Cmd<Msg>] => {
  switch (msg[0]) {
    case "BackendModel": {
      return [{ ...model, backendModel: RemoteData.Success(msg[1]) }, Cmd.None];
    }
  }
};

//
//
//
// Subscriptions
//
//
//

export const subscriptions = (model: Model): Sub.Sub<Msg> => {
  return Sub.None;
};

//
//
//
// View
//
//
//

export const view =
  (model: Model): UI.View<Msg> =>
  (dispatch) => {
    return (
      <UI.Page>
        <UI.Toolbar>
          <UI.Box sx={{ flex: 1 }}>
            <UI.HeaderBackButton onClick={() => dispatch(["ClickedBack"])} />
          </UI.Box>
          <UI.Typography variant="h6" align="center" sx={{ flex: 1 }}>
            Admin
          </UI.Typography>
          <UI.Box sx={{ flex: 1 }}></UI.Box>
        </UI.Toolbar>
        <UI.Typography variant="h6" gutterBottom sx={{ paddingX: 2 }}>
          Backend State
        </UI.Typography>
      </UI.Page>
    );
  };
