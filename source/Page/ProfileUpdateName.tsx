import { ChevronLeft } from "@mui/icons-material";
import { LoadingButton } from "@mui/lab";
import { Box, IconButton, TextField, Toolbar, Typography } from "@mui/material";
import * as React from "react";
import { cmd, react } from "../Framework";
import * as Profile from "../Profile";
import * as Router from "../Navigation";
import * as View from "../View";

/* 


Model


*/

export type Model = { status: "Idle" | "Loading"; name: string };

export const init = ({ name }: { name: string }): Model => {
  return {
    status: "Idle",
    name,
  };
};

/* 


Update


*/

export type Msg =
  | { type: "EnteredName"; name: string }
  | { type: "Submit" }
  | { type: "SubmitSucceeded" }
  | { type: "SubmitFailed" }
  | { type: "Back" };

export const update =
  ({ userId }: { userId: string }) =>
  (msg: Msg, model: Model): [Model, cmd.Cmd<Msg>] => {
    switch (msg.type) {
      case "EnteredName":
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
        return [model, Router.replace("Account")];
    }
  };

/* 


View


*/

export const view =
  (model: Model): react.Html<Msg> =>
  (dispatch) =>
    (
      <View.Page>
        <View.Header
          left={
            <View.HeaderBackButton onClick={() => dispatch({ type: "Back" })} />
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
            Update
          </LoadingButton>
        </Box>
      </View.Page>
    );
