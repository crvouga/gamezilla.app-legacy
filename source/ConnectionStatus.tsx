import * as UI from "UI";
import { onConnectionStatus } from "Bridge/Frontend";
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
      <UI.LoadingDialog
        open={model === "Connecting" || model === "Reconnecting"}
        title={"Connecting..."}
      />
    );
  };
