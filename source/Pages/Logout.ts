import * as Route from "../Route";
import * as Auth from "../Auth";
import * as Snackbar from "../Snackbar";
import * as UI from "../UI";
import { Cmd } from "../Core";

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

export type Msg = ["ClickedCancel"] | ["ClickedBackdrop"] | ["ClickedLogout"];

type OutAction = Auth.Action;

export const update = (
  { name }: { name: string },
  msg: Msg,
  model: Model,
): [Model, Cmd.Cmd<Msg>, OutAction[]] => {
  switch (msg[0]) {
    case "ClickedCancel":
      return [model, Route.back, []];

    case "ClickedBackdrop":
      return [model, Route.back, []];

    case "ClickedLogout":
      return [{ type: "LoggingOut" }, Cmd.None, [["Auth", ["Logout"]]]];
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
        onConfirm: ["ClickedLogout"],
        confirmTitle: "Logout",
        onClose: ["ClickedBackdrop"],
        onCancel: ["ClickedCancel"],
      });

    case "LoggingOut":
      return UI.loadingDialog({
        open: model.type === "LoggingOut",
        title: "Logging out...",
      });
  }
};
