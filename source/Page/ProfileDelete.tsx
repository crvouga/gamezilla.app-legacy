import { LoadingButton } from "@mui/lab";
import { Button, Dialog, DialogActions, DialogTitle } from "@mui/material";
import React from "react";
import { cmd, react } from "../Framework";
import * as Navigation from "../Framework/Navigation";
import * as Profile from "../Profile";

/* 


Model


*/

export type Model = { type: "Idle" } | { type: "Deleting" };

export const init: Model = { type: "Idle" };

/* 


Update


*/

export type Msg =
  | { type: "Cancel" }
  | { type: "Delete" }
  | { type: "DeleteSucceeded" }
  | { type: "DeleteFailed" };

export const update =
  ({ userId }: { userId: string }) =>
  (msg: Msg, model: Model): [Model, cmd.Cmd<Msg>] => {
    switch (msg.type) {
      case "Cancel":
        return [{ type: "Idle" }, Navigation.back()];

      case "Delete":
        return [
          { type: "Deleting" },
          Profile.remove<Msg>({
            userId,
            onSuccess: () => ({ type: "DeleteSucceeded" }),
            onFailure: () => ({ type: "DeleteFailed" }),
          }),
        ];

      case "DeleteFailed":
        return [{ type: "Idle" }, cmd.none];

      case "DeleteSucceeded":
        return [{ type: "Idle" }, cmd.none];
    }
  };

/* 


View


*/

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
