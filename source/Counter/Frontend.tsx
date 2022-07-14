import * as UI from "UI";
import { sendToBackend } from "Bridge";
import { Cmd, Option, Sub, pipe } from "Core";
import { FrontendModel, FrontendMsg, ToFrontend } from "./Types";

//
//
//
// Model
//
//
//

export type Model = FrontendModel;

export const init: [Model, Cmd.Cmd<FrontendMsg>] = [Option.None, Cmd.None];

//
//
//
// Update
//
//
//

export const update = (
  msg: FrontendMsg,
  model: Model,
): [Model, Cmd.Cmd<FrontendMsg>] => {
  switch (msg[0]) {
    case "ClickedToggle":
      return [model, sendToBackend(["Counter", ["ClickedToggle"]])];
  }
};

export const updateFromBackend = (
  msg: ToFrontend,
  _model: Model,
): [Model, Cmd.Cmd<FrontendMsg>] => {
  switch (msg[0]) {
    case "CounterNew":
      return [Option.Some(msg[1]), Cmd.None];
  }
};

//
//
//
// Subscriptions
//
//
//

export const subscriptions = (model: Model): Sub.Sub<FrontendMsg> => {
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
  (model: Model): UI.View<FrontendMsg> =>
  (dispatch) => {
    return (
      <UI.Box sx={{ p: 2, display: "flex", alignItems: "center" }}>
        <UI.Typography sx={{ flex: 1 }}>
          {pipe(
            model,
            Option.map((counter) => String(counter.count)),
            Option.withDefault("Loading..."),
          )}
        </UI.Typography>
        <UI.Button
          // onClick={() => dispatch({ group: "Counter", type: "ClickedReset" })}
          disabled={model.type === "None"}
        >
          Reset
        </UI.Button>
        <UI.Button
          onClick={() => dispatch(["ClickedToggle"])}
          disabled={model.type == "None"}
        >
          {pipe(
            model,
            Option.fold(
              () => "...",
              (counter) => (counter.status === "Idle" ? "Play" : "Pause"),
            ),
          )}
        </UI.Button>
      </UI.Box>
    );
  };
