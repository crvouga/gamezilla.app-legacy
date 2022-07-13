import * as UI from "UI";
import { Cmd, Fullstack, Option, Sub, pipe } from "Core";
import { exhaustive } from "Utility";
import { FrontendModel, FrontendMsg, ToFrontend } from "./Types";

//
//
//
// Model
//
//
//

export type Model = FrontendModel;

export const init: [Model, Cmd.Cmd<Msg>] = [Option.None, Cmd.None];

//
//
//
// Update
//
//
//

type Msg = FrontendMsg;

export const update = (msg: Msg, model: Model): [Model, Cmd.Cmd<Msg>] => {
  switch (msg.type) {
    case "ClickedToggle":
      return [
        model,
        Fullstack.sendToBackend({ group: "Counter", type: "Toggle" }),
        // sendToBackend({ group: "Counter", type: "Toggle" })
        // Cmd.None,
      ];

    default:
      return exhaustive(msg.type);
  }
};

export const updateFromBackend = (
  msg: ToFrontend,
  _model: Model,
): [Model, Cmd.Cmd<Msg>] => {
  switch (msg.type) {
    case "CounterNew":
      return [Option.Some(msg.counter), Cmd.None];
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
          onClick={() => dispatch({ group: "Counter", type: "ClickedToggle" })}
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
