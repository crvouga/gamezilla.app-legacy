import { LoadingButton } from "@mui/lab";
import { Button, Dialog, DialogActions, DialogTitle } from "@mui/material";
import { either } from "fp-ts";
import { pipe } from "fp-ts/lib/function";
import React from "react";
import { cmd, navigation, react } from "Framework";
import { attempt } from "Framework/Task";
import * as Routes from "Routes";
import * as Session from "../Session";

//
//
//
//
// Model
//
//
//
//

export type Model = { type: "Idle" } | { type: "Loading" };

export const init: Model = { type: "Idle" };

//
//
//
//
// Update
//
//
//
//

export type Msg =
  | { type: "Cancel" }
  | { type: "Logout" }
  | { type: "LogoutFailed" }
  | { type: "LogoutSucceeded" };

export const update = (msg: Msg, model: Model): [Model, cmd.Cmd<Msg>] => {
  switch (msg.type) {
    case "Cancel":
      return [
        { type: "Idle" },
        navigation.replace(Routes.encode({ type: "Account" })),
      ];

    case "Logout":
      return [
        { type: "Loading" },
        pipe(
          Session.logout,
          attempt(
            either.fold<{}, {}, Msg>(
              () => ({ group: "Logout", type: "LogoutFailed" }),
              () => ({ group: "Logout", type: "LogoutSucceeded" })
            )
          )
        ),
      ];

    case "LogoutFailed":
      return [model, cmd.none];

    case "LogoutSucceeded":
      return [model, cmd.none];
  }
};

//
//
//
//
// View
//
//
//
//

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
            onClick={() => dispatch({ type: "Logout" })}
          >
            Logout
          </LoadingButton>
        </DialogActions>
      </Dialog>
    );
