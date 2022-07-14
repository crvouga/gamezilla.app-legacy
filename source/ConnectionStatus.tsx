import * as UI from "UI";
import { onConnectionStatus } from "Bridge";
import { Cmd, Sub } from "Core";

//
//
//
//
// Model
//
//
//

export type Model =
  | "Connecting"
  | "Reconnecting"
  | "Disconnected"
  | "Connected";

export const init: Model = "Connecting";

//
//
//
// Update
//
//
//

export type Msg = ["Got", Model];

export const update = (msg: Msg, model: Model): [Model, Cmd.Cmd<Msg>] => {
  switch (msg[0]) {
    case "Got":
      return [msg[1], Cmd.None];
  }
};

//
//
//
// Subscriptions
//
//
//

export const subscriptions: Sub.Sub<Msg> = onConnectionStatus(
  (connectionStatus): Msg => ["Got", connectionStatus],
);

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
      <UI.Collapse in={model === "Reconnecting" || model === "Disconnected"}>
        <UI.Alert
          variant="filled"
          severity={
            model === "Disconnected"
              ? "error"
              : model === "Connected"
              ? "info"
              : "info"
          }
          sx={{ display: "flex", alignItems: "center" }}
          icon={<UI.CircularProgress color="inherit" disableShrink size={18} />}
        >
          {model === "Reconnecting"
            ? `Reconnecting to backend...`
            : model === "Disconnected"
            ? "Failed to connect to backend."
            : "Connected."}
        </UI.Alert>
      </UI.Collapse>
    );
  };
