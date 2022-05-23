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
//
// Model
//
//
//
//

export type Model = { status: "Idle" | "Loading"; name: string };

export const init = ({ name }: { name: string }): Model => {
  return {
    status: "Idle",
    name,
  };
};

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
  | { group: "ProfileUpdateName"; type: "EnteredName"; name: string }
  | { group: "ProfileUpdateName"; type: "Submit" }
  | { group: "ProfileUpdateName"; type: "SubmitSucceeded" }
  | { group: "ProfileUpdateName"; type: "SubmitFailed" }
  | { group: "ProfileUpdateName"; type: "Back" };

export const update = (
  { userId }: { userId: string },
  msg: Msg,
  model: Model
): [Model, cmd.Cmd<Msg>] => {
  switch (msg.type) {
    case "EnteredName":
      return [{ ...model, ...msg }, cmd.none];

    case "Submit":
      return [
        { ...model, status: "Loading" },
        pipe(
          Profile.edit({
            userId,
            ...model,
          }),
          attempt(
            either.fold<{}, {}, Msg>(
              () => ({
                group: "ProfileUpdateName",
                type: "SubmitFailed",
              }),
              () => ({
                group: "ProfileUpdateName",
                type: "SubmitSucceeded",
              })
            )
          )
        ),
      ];

    case "SubmitSucceeded":
      return [{ ...model, status: "Idle" }, cmd.none];

    case "SubmitFailed":
      return [{ ...model, status: "Idle" }, cmd.none];

    case "Back":
      return [model, navigation.back()];
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
      <View.Page>
        <View.Header
          left={
            <View.HeaderBackButton
              onClick={() =>
                dispatch({ group: "ProfileUpdateName", type: "Back" })
              }
            />
          }
          title="Name"
        />

        <Box sx={{ p: 2, width: "100%" }}>
          <TextField
            value={model.name}
            sx={{ marginBottom: 4 }}
            label="Name"
            fullWidth
            onChange={(event) =>
              dispatch({
                group: "ProfileUpdateName",
                type: "EnteredName",
                name: event.currentTarget.value,
              })
            }
          />

          <LoadingButton
            fullWidth
            size="large"
            variant="contained"
            loading={model.status === "Loading"}
            onClick={() =>
              dispatch({ group: "ProfileUpdateName", type: "Submit" })
            }
          >
            Update
          </LoadingButton>
        </Box>
      </View.Page>
    );
