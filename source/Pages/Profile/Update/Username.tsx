import { LoadingButton } from "@mui/lab";
import { Box, TextField } from "@mui/material";
import { either } from "fp-ts";
import { pipe } from "fp-ts/lib/function";
import { cmd, navigation, react } from "Framework";
import { attempt } from "Framework/Task";
import * as Profile from "Profile";
import * as React from "react";
import * as Routes from "Routes";
import * as View from "View";

//
//
//
//
// Model
//
//
//
//

export type Model = { status: "Idle" | "Loading"; username: string };

export const init = ({ username }: { username: string }): Model => {
  return {
    status: "Idle",
    username,
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
  | {
      group: "ProfileUpdateUsername";
      type: "EnteredUsername";
      username: string;
    }
  | { group: "ProfileUpdateUsername"; type: "Submit" }
  | { group: "ProfileUpdateUsername"; type: "SubmitSucceeded" }
  | { group: "ProfileUpdateUsername"; type: "SubmitFailed" }
  | { group: "ProfileUpdateUsername"; type: "Back" };

export const update = (
  { userId }: { userId: string },
  msg: Msg,
  model: Model
): [Model, cmd.Cmd<Msg>] => {
  switch (msg.type) {
    case "EnteredUsername":
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
                group: "ProfileUpdateUsername",
                type: "SubmitFailed",
              }),
              () => ({
                group: "ProfileUpdateUsername",
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
                dispatch({ group: "ProfileUpdateUsername", type: "Back" })
              }
            />
          }
          title="Username"
        />

        <Box sx={{ p: 2, width: "100%" }}>
          <TextField
            value={model.username}
            sx={{ marginBottom: 4 }}
            label="Username"
            fullWidth
            onChange={(event) =>
              dispatch({
                type: "EnteredUsername",
                group: "ProfileUpdateUsername",
                username: event.currentTarget.value,
              })
            }
          />

          <LoadingButton
            fullWidth
            size="large"
            variant="contained"
            loading={model.status === "Loading"}
            onClick={() =>
              dispatch({ group: "ProfileUpdateUsername", type: "Submit" })
            }
          >
            Update
          </LoadingButton>
        </Box>
      </View.Page>
    );
