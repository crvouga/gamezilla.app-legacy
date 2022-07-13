import * as UI from "UI";
import { Cmd } from "Core";
import { ConnectionStatus } from "Core/Fullstack";

//
//
//
// Model
//
//
//

export type Model = ConnectionStatus;

export const init: Model = { type: "Connecting" };

//
//
//
// Update
//
//
//

export type Msg = {
  group: "Connection";
  type: "ConnectionChanged";
  status: Model;
};

export const update = (msg: Msg, model: Model): [Model, Cmd.Cmd<Msg>] => {
  switch (msg.type) {
    case "ConnectionChanged":
      return [msg.status, Cmd.None];
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
  (model: Model): UI.View<Msg> =>
  (_dispatch) => {
    return (
      <UI.Collapse
        in={model.type === "Reconnecting" || model.type === "Disconnected"}
      >
        <UI.Alert
          variant="filled"
          severity={
            model.type === "Disconnected"
              ? "error"
              : model.type === "Connected"
              ? "info"
              : "info"
          }
          sx={{ display: "flex", alignItems: "center" }}
          icon={<UI.CircularProgress color="inherit" disableShrink size={18} />}
        >
          {model.type === "Reconnecting"
            ? `Reconnecting to backend...`
            : model.type === "Disconnected"
            ? "Failed to connect to backend."
            : "Connected."}
        </UI.Alert>
      </UI.Collapse>
    );
  };
