import { either } from "fp-ts";
import { pipe } from "fp-ts/lib/function";
import { cmd, react } from "Framework";
import { attempt } from "Framework/Task";
import React from "react";
import * as Session from "../Session";
import * as View from "../View";

//
//
//
// Model
//
//
//

export type Model =
  | { type: "Idle" }
  | { type: "LoggingIn"; loginMethod: Session.LoginMethod };

export const init: Model = { type: "Idle" };

//
//
//
// Update
//
//
//

export type Msg =
  | { type: "UserClickedLoginButton"; loginMethod: Session.LoginMethod }
  | { type: "LoginFailed" }
  | { type: "LoginSucceeded" };

export const update = (msg: Msg, model: Model): [Model, cmd.Cmd<Msg>] => {
  switch (msg.type) {
    case "UserClickedLoginButton":
      return [
        { type: "LoggingIn", loginMethod: msg.loginMethod },
        loginCmd(msg.loginMethod),
      ];

    case "LoginFailed":
      return [model, cmd.none];

    case "LoginSucceeded":
      return [model, cmd.none];
  }
};

const loginCmd = (loginMethod: Session.LoginMethod) => {
  return pipe(
    Session.login(loginMethod),
    attempt(
      either.fold<{}, {}, Msg>(
        () => ({ type: "LoginFailed" }),
        () => ({ type: "LoginSucceeded" })
      )
    )
  );
};

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
      <View.Page
        sx={{
          alignItems: "center",
          justifyContent: "center",
          p: 2,
        }}
      >
        <View.Typography variant="h1" sx={{ marginBottom: 2 }}>
          Gamezilla
        </View.Typography>

        <View.Button
          variant="contained"
          size="large"
          fullWidth
          onClick={() =>
            dispatch({
              type: "UserClickedLoginButton",
              loginMethod: { type: "Google" },
            })
          }
        >
          Continue With Google
        </View.Button>

        {viewLoadingDialog(model)}
      </View.Page>
    );

const viewLoadingDialog = (model: Model) => {
  switch (model.type) {
    case "LoggingIn":
      switch (model.loginMethod.type) {
        case "Google":
          return <View.LoadingDialog open title="Redirecting to Google..." />;
      }

    default:
      return <></>;
  }
};
