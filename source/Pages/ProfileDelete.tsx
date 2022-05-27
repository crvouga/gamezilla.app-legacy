import { either } from "fp-ts";
import { pipe } from "fp-ts/lib/function";
import { cmd, react } from "Framework";
import * as Navigation from "Navigation";
import { attempt } from "Framework/Task";
import * as Profile from "Profile";
import React from "react";
import * as View from "View";

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
      return [model, Navigation.back()];

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
      return [model, Navigation.back()];

    case "DeleteProfileFailed":
      return [{ type: "Idle" }, cmd.none];

    case "DeleteProfileSucceeded":
      return [model, Navigation.reload()];
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
