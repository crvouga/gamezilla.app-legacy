import { Box, TextField } from "@mui/material";
import { option, either } from "fp-ts";
import { pipe } from "fp-ts/lib/function";
import { cmd, navigation, react } from "Framework";
import { attempt } from "Framework/Task";
import * as Profile from "Profile";
import * as React from "react";
import * as View from "View";
import * as Snackbar from "Snackbar";

//
//
//
// Model
//
//
//

export type Model = { status: "Idle" | "UpdatingUsername"; username: string };

export const init = ({ username }: { username: string }): Model => {
  return {
    status: "Idle",
    username,
  };
};

//
//
//
// Update
//
//
//

export type Msg =
  | { type: "UserClickedCancelButton" }
  | { type: "UserEnteredUsername"; username: string }
  | { type: "UserClickedSubmitButton" }
  | { type: "UsernameUpdateFailed" }
  | { type: "UsernameUpdateSucceeded" };

export type OutMsg = Snackbar.GroupedMsg;

export const update = (
  { userId }: { userId: string },
  msg: Msg,
  model: Model
): [Model, cmd.Cmd<Msg>, OutMsg[]] => {
  switch (msg.type) {
    case "UserEnteredUsername":
      return [{ ...model, username: msg.username }, cmd.none, []];

    case "UserClickedSubmitButton":
      return [
        { ...model, status: "UpdatingUsername" },
        updateUsernameCmd(userId, model),
        [],
      ];

    case "UserClickedCancelButton":
      return [model, navigation.back(), []];

    case "UsernameUpdateFailed":
      return [{ ...model, status: "Idle" }, cmd.none, []];

    case "UsernameUpdateSucceeded":
      return [
        { ...model, status: "Idle" },
        navigation.back(),
        [Snackbar.EnqueuedSnackbar("Updated username.")],
      ];
  }
};

const updateUsernameCmd = (userId: string, model: Model) =>
  pipe(
    Profile.edit({
      userId,
      ...model,
    }),
    attempt(
      either.fold<{}, {}, Msg>(
        () => ({ type: "UsernameUpdateFailed" }),
        () => ({ type: "UsernameUpdateSucceeded" })
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
      <View.Page>
        <View.Header
          left={
            <View.Button
              sx={{ marginLeft: -1 }}
              onClick={() => dispatch({ type: "UserClickedCancelButton" })}
            >
              Cancel
            </View.Button>
          }
          title="Username"
          right={
            <View.Button
              sx={{ marginRight: -1 }}
              onClick={() => dispatch({ type: "UserClickedSubmitButton" })}
            >
              Done
            </View.Button>
          }
        />

        <View.LoadingDialog
          open={model.status === "UpdatingUsername"}
          title="Updating username..."
        />

        <Box sx={{ p: 2, width: "100%" }}>
          <TextField
            value={model.username}
            sx={{ marginBottom: 4 }}
            label="Username"
            fullWidth
            onChange={(event) =>
              dispatch({
                type: "UserEnteredUsername",
                username: event.currentTarget.value,
              })
            }
          />
        </Box>
      </View.Page>
    );
