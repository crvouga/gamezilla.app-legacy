import * as Route from "Route";
import * as Session from "Session";
import * as Snackbar from "Snackbar";
import * as UI from "UI";
import { Cmd, Result, pipe } from "Core";

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
  | { type: "UserClickedCancelButton" }
  | { type: "UserClickedBackdrop" }
  | { type: "UserClickedLogoutButton" }
  | { type: "LogoutFailed" }
  | { type: "LogoutSucceeded" };

type OutAction = Snackbar.Action | Session.Action;

export const update = (
  { name }: { name: string },
  msg: Msg,
  model: Model,
): [Model, Cmd.Cmd<Msg>, OutAction[]] => {
  switch (msg.type) {
    case "UserClickedCancelButton":
      return [model, Route.back, []];

    case "UserClickedBackdrop":
      return [model, Route.back, []];

    case "UserClickedLogoutButton":
      return [{ type: "LoggingOut" }, Cmd.None, [Session.Logout()]];

    case "LogoutFailed":
      return [model, Cmd.None, []];

    case "LogoutSucceeded":
      return [model, Cmd.None, []];
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
  (dispatch) =>
    (
      <>
        <UI.ConformationDialog
          open={model.type === "Idle"}
          title="Logout of Gamezilla?"
          onClose={() => dispatch({ type: "UserClickedBackdrop" })}
          onCancel={() => dispatch({ type: "UserClickedCancelButton" })}
          confirmTitle="Logout"
          onConfirm={() => dispatch({ type: "UserClickedLogoutButton" })}
        />

        <UI.LoadingDialog
          open={model.type === "LoggingOut"}
          title="Logging out..."
        />
      </>
    );
