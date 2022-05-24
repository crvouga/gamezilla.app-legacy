import { either } from "fp-ts";
import { pipe } from "fp-ts/lib/function";
import { cmd, navigation, react, task } from "Framework";
import React from "react";
import * as Session from "Session";
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

export const update = (msg: Msg, model: Model): [Model, cmd.Cmd<Msg>] => {
  switch (msg.type) {
    case "UserClickedCancelButton":
      return [model, navigation.back()];

    case "UserClickedBackdrop":
      return [model, navigation.back()];

    case "UserClickedLogoutButton":
      return [{ type: "LoggingOut" }, logoutCmd];

    case "LogoutFailed":
      return [model, cmd.none];

    case "LogoutSucceeded":
      return [model, cmd.none];
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
  (model: Model): react.Html<Msg> =>
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
