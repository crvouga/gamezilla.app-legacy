import { LoadingButton } from "@mui/lab";
import { Button, Dialog, DialogActions, DialogTitle } from "@mui/material";
import React from "react";
import { cmd, react } from "../Framework";
import * as Routes from "../Routes";
import * as Auth from "../Auth";

/* 


Model


*/

export type Model = { type: "Idle" } | { type: "Loading" };

export const init: Model = { type: "Idle" };

/* 


Update


*/

export type Msg =
  | { group: "Logout"; type: "Cancel" }
  | { group: "Logout"; type: "Confirm" };

export const update = (msg: Msg, model: Model): [Model, cmd.Cmd<Msg>] => {
  switch (msg.type) {
    case "Cancel":
      return [{ type: "Idle" }, Routes.replace({ type: "Account" })];

    case "Confirm":
      return [{ type: "Loading" }, Auth.logout()];
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
        onClose={() => dispatch({ group: "Logout", type: "Cancel" })}
      >
        <DialogTitle>Logout of Gamezilla?</DialogTitle>
        <DialogActions>
          <Button
            disabled={model.type === "Loading"}
            onClick={() => dispatch({ group: "Logout", type: "Cancel" })}
          >
            Cancel
          </Button>
          <LoadingButton
            loading={model.type === "Loading"}
            onClick={() => dispatch({ group: "Logout", type: "Confirm" })}
          >
            Logout
          </LoadingButton>
        </DialogActions>
      </Dialog>
    );
