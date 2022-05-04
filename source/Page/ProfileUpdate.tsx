import { ChevronLeft } from "@mui/icons-material";
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
import * as React from "react";
import { cmd, react } from "../Framework";
import * as Profile from "../Profile";
import * as Session from "../Session";
import * as Navigation from "../Framework/Navigation";

/* 


Model


*/

type Form = {
  username: string;
  name: string;
  avatarUrl: string;
};

export type Model = { status: "Idle" | "Loading"; form: Form };

export const init = (form: Form): Model => {
  return {
    status: "Idle",
    form,
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
  | { type: "ClickedBackButton" };

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
          Profile.update<Msg>({
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

      case "ClickedBackButton":
        return [model, Navigation.back()];
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
              onClick={() => dispatch({ type: "ClickedBackButton" })}
            >
              <ChevronLeft />
            </IconButton>
          </Box>

          <Typography sx={{ flex: 1 }} align="center" variant="h6">
            Update Profile
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
            Update Profile
          </LoadingButton>
        </Box>
      </Box>
    );
