import { LoadingButton } from "@mui/lab";
import { Button, Dialog, DialogActions, DialogTitle } from "@mui/material";
import { either } from "fp-ts";
import { pipe } from "fp-ts/lib/function";
import { cmd, navigation, react } from "Framework";
import { attempt } from "Framework/Task";
import * as Profile from "Profile";
import React from "react";

//
//
//
// Model
//
//
//

export type Model = { type: "Idle" } | { type: "Deleting" };

export const init: Model = { type: "Idle" };

//
//
//
// Update
//
//
//

export type Msg =
  | { type: "Cancel" }
  | { type: "Delete" }
  | { type: "DeleteSucceeded" }
  | { type: "DeleteFailed" };

export const update = (
  { userId }: { userId: string },
  msg: Msg,
  model: Model
): [Model, cmd.Cmd<Msg>] => {
  switch (msg.type) {
    case "Cancel":
      return [{ type: "Idle" }, navigation.back()];

    case "Delete":
      return [
        { type: "Deleting" },
        pipe(
          Profile.deleteForever({
            userId,
          }),
          attempt(
            either.fold<{}, {}, Msg>(
              () => ({
                type: "DeleteFailed",
              }),
              () => ({
                type: "DeleteSucceeded",
              })
            )
          )
        ),
      ];

    case "DeleteFailed":
      return [{ type: "Idle" }, cmd.none];

    case "DeleteSucceeded":
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
      <Dialog open onClose={() => dispatch({ type: "Cancel" })}>
        <DialogTitle>Delete your profile forever?</DialogTitle>
        <DialogActions>
          <Button
            disabled={model.type === "Deleting"}
            onClick={() => dispatch({ type: "Cancel" })}
          >
            Cancel
          </Button>
          <LoadingButton
            loading={model.type === "Deleting"}
            onClick={() => dispatch({ type: "Delete" })}
          >
            Delete
          </LoadingButton>
        </DialogActions>
      </Dialog>
    );
