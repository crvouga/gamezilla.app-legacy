import { LoadingButton } from "@mui/lab";
import { Avatar, Box, Button, TextField } from "@mui/material";
import * as React from "react";
import { cmd, react } from "Framework";
import * as Profile from "../../Profile";
import * as ProfileAvatar from "../../ProfileAvatar";
import * as Session from "../../Session";
import * as View from "View";
import { Logout } from "@mui/icons-material";
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

type Form = {
  username: string;
  name: string;
  avatarUrl: string;
};

const initForm = ({ defaultName }: { defaultName: string }): Form => {
  const username = defaultName.replace(" ", "").toLowerCase();

  return {
    username,
    name: defaultName,
    avatarUrl: ProfileAvatar.toUrl({
      seed: ProfileAvatar.toSeed(username),
      style: "adventurer-neutral",
    }),
  };
};

export type Model = { status: "Idle" | "Loading" | "LoggingOut"; form: Form };

export const init = ({ defaultName }: { defaultName: string }): Model => {
  return {
    status: "Idle",
    form: initForm({ defaultName }),
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
  | { type: "EnteredUsername"; username: string }
  | { type: "EnteredName"; name: string }
  | { type: "Submit" }
  | { type: "SubmitSucceeded" }
  | { type: "SubmitFailed" }
  | { type: "Logout" }
  | { type: "LogoutFailed" }
  | { type: "LogoutSucceeded" };

export const update = (
  { userId }: { userId: string },
  msg: Msg,
  model: Model
): [Model, cmd.Cmd<Msg>] => {
  switch (msg.type) {
    case "EnteredName":
      return [{ ...model, form: { ...model.form, ...msg } }, cmd.none];

    case "EnteredUsername":
      return [{ ...model, form: { ...model.form, ...msg } }, cmd.none];

    case "Submit":
      return [
        { ...model, status: "Loading" },
        Profile.create<Msg>({
          ...model.form,
          userId,
          onFailure: () => ({
            group: "ProfileCreate",
            type: "SubmitFailed",
          }),
          onSuccess: () => ({
            group: "ProfileCreate",
            type: "SubmitSucceeded",
          }),
        }),
      ];

    case "SubmitSucceeded":
      return [{ ...model, status: "Idle" }, cmd.none];

    case "SubmitFailed":
      return [{ ...model, status: "Idle" }, cmd.none];

    case "Logout":
      return [
        { ...model, status: "LoggingOut" },
        pipe(
          Session.logout,
          attempt(
            either.fold<{}, {}, Msg>(
              () => ({ type: "LogoutFailed" }),
              () => ({ type: "LogoutSucceeded" })
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
      <View.Page>
        <View.Header
          left={
            <View.Button
              loading={model.status === "LoggingOut"}
              sx={{ marginLeft: -1 }}
              onClick={() => dispatch({ type: "Logout" })}
            >
              Logout
            </View.Button>
          }
          title="Create Profile"
        />

        <View.LoadingBackdrop open={model.status === "LoggingOut"} />

        <Box sx={{ p: 2, width: "100%" }}>
          <Avatar
            src={model.form.avatarUrl}
            sx={{
              marginX: "auto",
              width: "150px",
              height: "150px",
              marginBottom: 1,
            }}
          />

          <Button sx={{ display: "block", marginX: "auto", marginBottom: 2 }}>
            Change Avatar
          </Button>

          <TextField
            value={model.form.username}
            sx={{ marginBottom: 2 }}
            label="Username"
            fullWidth
            onChange={(event) =>
              dispatch({
                type: "EnteredUsername",
                username: event.currentTarget.value,
              })
            }
          />

          <TextField
            value={model.form.name}
            sx={{ marginBottom: 4 }}
            label="Name"
            fullWidth
            onChange={({ currentTarget: { value: name } }) =>
              dispatch({ type: "EnteredName", name })
            }
          />

          <LoadingButton
            fullWidth
            size="large"
            variant="contained"
            loading={model.status === "Loading"}
            onClick={() => dispatch({ type: "Submit" })}
          >
            Create Profile
          </LoadingButton>
        </Box>
      </View.Page>
    );
