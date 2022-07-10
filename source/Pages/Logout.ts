import * as Route from "Route";
import * as Session from "Session";
import * as Snackbar from "Snackbar";
import * as UI from "UI";
import { Cmd } from "Core";

//
//
//
// Model
//
//
//

export type Model = { type: "Idle" } | { type: "LoggingOut" };

export const init: Model = { type: "Idle" };

//
//
//
// Update
//
//
//

export type Msg =
  | { type: "ClickedCancel" }
  | { type: "ClickedBackdrop" }
  | { type: "ClickedLogout" };

type OutAction = Snackbar.Action | Session.Action;

export const update = (
  { name }: { name: string },
  msg: Msg,
  model: Model,
): [Model, Cmd.Cmd<Msg>, OutAction[]] => {
  switch (msg.type) {
    case "ClickedCancel":
      return [model, Route.back, []];

    case "ClickedBackdrop":
      return [model, Route.back, []];

    case "ClickedLogout":
      return [{ type: "LoggingOut" }, Cmd.None, [Session.Logout()]];
  }
};

//
//
//
// View
//
//
//

export const view = (model: Model): UI.View<Msg> => {
  switch (model.type) {
    case "Idle":
      return UI.conformationDialog<Msg>({
        open: model.type === "Idle",
        title: "Logout of Gamezilla?",
        onConfirm: { type: "ClickedLogout" },
        confirmTitle: "Logout",
        onClose: { type: "ClickedBackdrop" },
        onCancel: { type: "ClickedCancel" },
      });

    case "LoggingOut":
      return UI.loadingDialog({
        open: model.type === "LoggingOut",
        title: "Logging out...",
      });
  }
};
