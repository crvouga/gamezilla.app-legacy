import { LoadingButton } from "@mui/lab";
import { Button, Dialog, DialogActions, DialogTitle } from "@mui/material";
import { either } from "fp-ts";
import { pipe } from "fp-ts/lib/function";
import { cmd, navigation, react } from "Framework";
import { attempt } from "Framework/Task";
import * as Profile from "Profile";
import * as View from "View";
import React from "react";

//
//
//
// Model
//
//
//

export type Model = { type: "Idle" } | { type: "DeletingProfile" };

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
  | { type: "UserClickedDeleteButton" }
  | { type: "DeleteProfileSucceeded" }
  | { type: "DeleteProfileFailed" };

export const update = (
  { userId }: { userId: string },
  msg: Msg,
  model: Model
): [Model, cmd.Cmd<Msg>] => {
  switch (msg.type) {
    case "UserClickedCancelButton":
      return [model, navigation.back()];

    case "UserClickedDeleteButton":
      return [
        { type: "DeletingProfile" },
        pipe(
          Profile.deleteForever({
            userId,
          }),
          attempt(
            either.fold<{}, {}, Msg>(
              () => ({ type: "DeleteProfileFailed" }),
              () => ({ type: "DeleteProfileSucceeded" })
            )
          )
        ),
      ];

    case "UserClickedBackdrop":
      return [model, navigation.back()];

    case "DeleteProfileFailed":
      return [{ type: "Idle" }, cmd.none];

    case "DeleteProfileSucceeded":
      return [{ type: "Idle" }, cmd.none];
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
  (model: Model): react.Html<Msg> =>
  (dispatch) =>
    (
      <>
        <View.LoadingDialog
          open={model.type === "DeletingProfile"}
          title="Deleting profile..."
        />

        <View.ConformationDialog
          open={model.type === "Idle"}
          title="Delete profile forever?"
          onClose={() => dispatch({ type: "UserClickedBackdrop" })}
          onCancel={() => dispatch({ type: "UserClickedCancelButton" })}
          confirmTitle="Delete"
          onConfirm={() => dispatch({ type: "UserClickedDeleteButton" })}
        />
      </>
    );
