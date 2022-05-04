import { ChevronLeft } from "@mui/icons-material";
import { LoadingButton } from "@mui/lab";
import { Box, IconButton, TextField, Toolbar, Typography } from "@mui/material";
import * as React from "react";
import { cmd, react } from "../Framework";
import * as Navigation from "../Framework/Navigation";
import * as Profile from "../Profile";

/* 


Model


*/

export type Model = { status: "Idle" | "Loading"; username: string };

export const init = ({ username }: { username: string }): Model => {
  return {
    status: "Idle",
    username,
  };
};

/* 


Update


*/

export type Msg =
  | { type: "EnteredUsername"; username: string }
  | { type: "Submit" }
  | { type: "SubmitSucceeded" }
  | { type: "SubmitFailed" }
  | { type: "Back" };

export const update =
  ({ userId }: { userId: string }) =>
  (msg: Msg, model: Model): [Model, cmd.Cmd<Msg>] => {
    switch (msg.type) {
      case "EnteredUsername":
        return [{ ...model, ...msg }, cmd.none];

      case "Submit":
        return [
          { ...model, status: "Loading" },
          Profile.update<Msg>({
            ...model,
            userId,
            onFailure: () => ({ type: "SubmitFailed" }),
            onSuccess: () => ({ type: "SubmitSucceeded" }),
          }),
        ];

      case "SubmitSucceeded":
        return [{ ...model, status: "Idle" }, cmd.none];

      case "SubmitFailed":
        return [{ ...model, status: "Idle" }, cmd.none];

      case "Back":
        return [model, Navigation.replace("ProfileUpdate")];
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
            <IconButton edge="start" onClick={() => dispatch({ type: "Back" })}>
              <ChevronLeft />
            </IconButton>
          </Box>

          <Typography sx={{ flex: 1 }} align="center" variant="h6">
            Username
          </Typography>

          <Box sx={{ flex: 1 }}></Box>
        </Toolbar>

        <Box sx={{ p: 2, width: "100%" }}>
          <TextField
            value={model.username}
            sx={{ marginBottom: 4 }}
            label="Username"
            fullWidth
            onChange={(event) =>
              dispatch({
                type: "EnteredUsername",
                username: event.currentTarget.value,
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
            Update
          </LoadingButton>
        </Box>
      </Box>
    );
