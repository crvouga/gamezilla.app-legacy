import { Close } from "@mui/icons-material";
import { LoadingButton } from "@mui/lab";
import {
  Avatar,
  Box,
  Button,
  IconButton,
  TextField,
  Toolbar,
  Typography,
} from "@mui/material";
import { cmd, react } from "elm-ts";
import * as React from "react";
import * as ProfileAvatar from "../ProfileAvatar";
import * as Session from "../Session";
import * as Profile from "../Profile";

/* 


Model


*/

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

export type Model = { status: "Idle" | "Loading"; form: Form };

export const init = ({ defaultName }: { defaultName: string }): Model => {
  return {
    status: "Idle",
    form: initForm({ defaultName }),
  };
};

/* 


Update


*/

export type Msg =
  | { type: "EnteredUsername"; username: string }
  | { type: "EnteredName"; name: string }
  | { type: "Submit" }
  | { type: "SubmitSucceeded" }
  | { type: "SubmitFailed" }
  | { type: "Logout" };

export const update =
  ({ userId }: { userId: string }) =>
  (msg: Msg, model: Model): [Model, cmd.Cmd<Msg>] => {
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
            onFailure: () => ({ type: "SubmitFailed" }),
            onSuccess: () => ({ type: "SubmitSucceeded" }),
          }),
        ];

      case "SubmitSucceeded":
        return [{ ...model, status: "Idle" }, cmd.none];

      case "SubmitFailed":
        return [{ ...model, status: "Idle" }, cmd.none];

      case "Logout":
        return [model, Session.logout()];
    }
  };

/* 


View


*/

export const view =
  (model: Model): react.Html<Msg> =>
  (dispatch) =>
    (
      <Box
        sx={{
          position: "fixed",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <Toolbar>
          <Box sx={{ flex: 1 }}>
            <IconButton
              edge="start"
              disabled={model.status === "Loading"}
              onClick={() => dispatch({ type: "Logout" })}
            >
              <Close />
            </IconButton>
          </Box>

          <Typography sx={{ flex: 1 }} align="center" variant="h6">
            Create Profile
          </Typography>

          <Box sx={{ flex: 1 }}></Box>
        </Toolbar>

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
            onChange={(event) =>
              dispatch({
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
            onClick={() => dispatch({ type: "Submit" })}
          >
            Create Profile
          </LoadingButton>
        </Box>
      </Box>
    );
