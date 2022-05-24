import { LoadingButton } from "@mui/lab";
import { Box, TextField } from "@mui/material";
import * as React from "react";
import { cmd, navigation, react } from "Framework";
import * as Profile from "Profile";
import * as Route from "Route";
import * as View from "View";
import { pipe } from "fp-ts/lib/function";
import { attempt } from "Framework/Task";
import { either } from "fp-ts";

//
//
//
// Model
//
//
//

export type Model = { status: "Idle" | "UpdatingName"; name: string };

export const init = ({ name }: { name: string }): Model => {
  return {
    status: "Idle",
    name,
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
  | { type: "UserEnteredName"; name: string }
  | { type: "UserClickedCancelButton" }
  | { type: "UserClickedSubmitButton" }
  | { type: "UpdateProfileNameFailed" }
  | { type: "UpdateProfileNameSucceeded" };

export const update = (
  { userId }: { userId: string },
  msg: Msg,
  model: Model
): [Model, cmd.Cmd<Msg>] => {
  switch (msg.type) {
    case "UserEnteredName":
      return [{ ...model, ...msg }, cmd.none];

    case "UserClickedSubmitButton":
      return [
        { ...model, status: "UpdatingName" },
        updateProfileNameCmd({ userId, name: model.name }),
      ];

    case "UpdateProfileNameSucceeded":
      return [{ ...model, status: "Idle" }, navigation.back()];

    case "UpdateProfileNameFailed":
      return [{ ...model, status: "Idle" }, cmd.none];

    case "UserClickedCancelButton":
      return [model, navigation.back()];
  }
};

//
//
// cmds
//
//

const updateProfileNameCmd = ({
  userId,
  name,
}: {
  userId: string;
  name: string;
}) =>
  pipe(
    Profile.edit({
      userId,
      name,
    }),
    attempt(
      either.fold<{}, {}, Msg>(
        () => ({ type: "UpdateProfileNameFailed" }),
        () => ({ type: "UpdateProfileNameSucceeded" })
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
          title="Name"
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
          open={model.status === "UpdatingName"}
          title="Updating name..."
        />

        <Box sx={{ padding: 2 }}>
          <TextField
            value={model.name}
            sx={{ marginBottom: 4 }}
            label="Name"
            fullWidth
            onChange={(event) =>
              dispatch({
                type: "UserEnteredName",
                name: event.currentTarget.value,
              })
            }
          />
        </Box>
      </View.Page>
    );
