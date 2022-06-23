import { either } from "fp-ts";
import { pipe } from "fp-ts/lib/function";
import { cmd, task } from "Core";
import * as Navigation from "Core/Navigation";
import * as Session from "Session";
import * as Snackbar from "Snackbar";
import * as View from "View";

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

type OutMsg = Snackbar.GroupedMsg;

export const update = (
  { name }: { name: string },
  msg: Msg,
  model: Model
): [Model, cmd.Cmd<Msg>, OutMsg[]] => {
  switch (msg.type) {
    case "UserClickedCancelButton":
      return [model, Navigation.back(), []];

    case "UserClickedBackdrop":
      return [model, Navigation.back(), []];

    case "UserClickedLogoutButton":
      return [{ type: "LoggingOut" }, logoutCmd, []];

    case "LogoutFailed":
      return [model, cmd.none, []];

    case "LogoutSucceeded":
      return [model, cmd.none, []];
  }
};

const logoutCmd = pipe(
  Session.logout,
  task.attempt(
    either.fold<{}, {}, Msg>(
      () => ({ type: "LogoutFailed" }),
      () => ({ type: "LogoutSucceeded" })
    )
  )
);

//
//
//
// View
//
//
//

export const view =
  (model: Model): View.View<Msg> =>
  (dispatch) =>
    (
      <>
        <View.ConformationDialog
          open={model.type === "Idle"}
          title="Logout of Gamezilla?"
          onClose={() => dispatch({ type: "UserClickedBackdrop" })}
          onCancel={() => dispatch({ type: "UserClickedCancelButton" })}
          confirmTitle="Logout"
          onConfirm={() => dispatch({ type: "UserClickedLogoutButton" })}
        />

        <View.LoadingDialog
          open={model.type === "LoggingOut"}
          title="Logging out..."
        />
      </>
    );
