import * as ReactDOM from "react-dom/client";
import * as UI from "../UI";
import { Browser, Cmd, RemoteData, Sub, Time } from "../Core";
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

type Msg = never;

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
      <UI.ThemeProvider themeMode="Dark">
        {JSON.stringify(model.backendModel, null, 4)}
      </UI.ThemeProvider>
    );
  };
