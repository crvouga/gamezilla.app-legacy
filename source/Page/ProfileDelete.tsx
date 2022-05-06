import { LoadingButton } from "@mui/lab";
import { Button, Dialog, DialogActions, DialogTitle } from "@mui/material";
import React from "react";
import { cmd, react } from "../Framework";
import * as Profile from "../Profile";
import * as Routing from "../Routing";

/* 


Model


*/

export type Model = { type: "Idle" } | { type: "Deleting" };

export const init: Model = { type: "Idle" };

/* 


Update


*/

export type Msg =
  | { group: "ProfileDelete"; type: "Cancel" }
  | { group: "ProfileDelete"; type: "Delete" }
  | { group: "ProfileDelete"; type: "DeleteSucceeded" }
  | { group: "ProfileDelete"; type: "DeleteFailed" };

export const update = (
  { userId }: { userId: string },
  msg: Msg,
  model: Model
): [Model, cmd.Cmd<Msg>] => {
  switch (msg.type) {
    case "Cancel":
      return [{ type: "Idle" }, Routing.Routes.replace({ type: "Account" })];

    case "Delete":
      return [
        { type: "Deleting" },
        Profile.remove<Msg>({
          userId,
          onSuccess: () => ({
            group: "ProfileDelete",
            type: "DeleteSucceeded",
          }),
          onFailure: () => ({
            group: "ProfileDelete",
            type: "DeleteFailed",
          }),
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
      <Dialog
        open
        onClose={() => dispatch({ group: "ProfileDelete", type: "Cancel" })}
      >
        <DialogTitle>Delete your profile forever?</DialogTitle>
        <DialogActions>
          <Button
            disabled={model.type === "Deleting"}
            onClick={() => dispatch({ group: "ProfileDelete", type: "Cancel" })}
          >
            Cancel
          </Button>
          <LoadingButton
            loading={model.type === "Deleting"}
            onClick={() => dispatch({ group: "ProfileDelete", type: "Delete" })}
          >
            Delete
          </LoadingButton>
        </DialogActions>
      </Dialog>
    );
