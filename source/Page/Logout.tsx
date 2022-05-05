import { LoadingButton } from "@mui/lab";
import { Button, Dialog, DialogActions, DialogTitle } from "@mui/material";
import React from "react";
import { cmd, react } from "../Framework";
import * as Router from "../Navigation";
import * as Session from "../Session";

/* 


Model


*/

export type Model = { type: "Idle" } | { type: "Loading" };

export const init: Model = { type: "Idle" };

/* 


Update


*/

export type Msg = { type: "Cancel" } | { type: "Confirm" };

export const update = (msg: Msg, model: Model): [Model, cmd.Cmd<Msg>] => {
  switch (msg.type) {
    case "Cancel":
      return [{ type: "Idle" }, Router.replace("Account")];

    case "Confirm":
      return [{ type: "Loading" }, Session.logout()];
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
        <DialogTitle>Logout of Gamezilla?</DialogTitle>
        <DialogActions>
          <Button
            disabled={model.type === "Loading"}
            onClick={() => dispatch({ type: "Cancel" })}
          >
            Cancel
          </Button>
          <LoadingButton
            loading={model.type === "Loading"}
            onClick={() => dispatch({ type: "Confirm" })}
          >
            Logout
          </LoadingButton>
        </DialogActions>
      </Dialog>
    );
