import { LoadingButton } from "@mui/lab";
import { Typography } from "@mui/material";
import React from "react";
import * as Session from "../Session";
import { cmd, react } from "../Framework";
import * as View from "../View";
import { pipe } from "fp-ts/lib/function";
import { attempt, perform } from "../Framework/Task";
import { either, option } from "fp-ts";

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

export const init = (): Model => {
  return { type: "Idle" };
};

/*


Update


*/

export type Msg = Login | LoginSucceeded | LoginFailed;

type Login = { group: "Login"; type: "Login" };
type LoginFailed = { group: "Login"; type: "LoginFailed" };
type LoginSucceeded = { group: "Login"; type: "LoginSucceeded" };

const Login = (): Msg => ({
  group: "Login",
  type: "Login",
});

const LoginFailed = (): Msg => ({
  group: "Login",
  type: "LoginFailed",
});

const LoginSucceeded = (): Msg => ({
  group: "Login",
  type: "LoginSucceeded",
});

export const update = (msg: Msg, model: Model): [Model, cmd.Cmd<Msg>] => {
  switch (msg.type) {
    case "Login":
      return [
        { type: "Loading" },
        pipe(Session.login, attempt(either.fold(LoginFailed, LoginSucceeded))),
      ];

    case "LoginFailed":
      return [model, cmd.none];

    case "LoginSucceeded":
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
      <View.Page
        sx={{
          alignItems: "center",
          justifyContent: "center",
          p: 2,
        }}
      >
        <Typography variant="h1" sx={{ marginBottom: 2 }}>
          Gamezilla
        </Typography>

        <LoadingButton
          variant="outlined"
          size="large"
          fullWidth
          loading={model.type === "Loading"}
          onClick={() => dispatch(Login())}
        >
          Continue With Google
        </LoadingButton>
      </View.Page>
    );
