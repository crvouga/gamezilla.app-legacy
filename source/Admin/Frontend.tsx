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

export const init = (tab: "Model" | "Msg"): Model => {
  return {
    backendModel: RemoteData.Loading,
    tab: "Model"
  }
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
              Backend
            </UI.Typography>
            <UI.Box sx={{ flex: 1 }}></UI.Box>
          </UI.Toolbar>
          <UI.Tabs variant="fullWidth" centered>
            <UI.Tab label="Model" />
            <UI.Tab label="Msg" />
          </UI.Tabs>
          <ViewBackendModel model={model} />
        </UI.Page>
      );
    };





const ViewBackendModel = ({ model }: { model: Model }) => {
  switch (model.backendModel.type) {
    case 'Loading':
    case 'NotAsked':
    case 'Failure':
      return <ViewLoading />

    case 'Success':
      return (
        <pre style={{ overflow: "scroll", padding: 0, margin: 0 }}>
          {JSON.stringify(model.backendModel.value, null, 2)}
        </pre>
      )
  }
}

const ViewLoading = () => {
  return (
    <UI.Box sx={{ width: "100%", flex: 1, display: "flex", alignItems: "center", justifyContent: 'center' }}>
      <UI.CircularProgress />
    </UI.Box>
  )
}