import * as Route from "Route";
import * as Session from "Session";
import * as View from "View";
import { SvgIconProps } from "@mui/material";
import { Cmd, Result, pipe } from "Core";

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
  | { type: "ClickedGoogleLogin" }
  | { type: "ClickedEmailLogin" }
  | { type: "LoginFailed" }
  | { type: "LoginSucceeded" };

type OutAction = Session.Action;

export const update = (
  msg: Msg,
  model: Model,
): [Model, Cmd.Cmd<Msg>, OutAction[]] => {
  switch (msg.type) {
    case "ClickedGoogleLogin":
      return [
        { type: "LoggingIn", loginMethod: { type: "Google" } },
        Cmd.None,

        [Session.Login({ type: "Google" })],
      ];

    case "LoginFailed":
      return [{ type: "Idle" }, Cmd.None, []];

    case "LoginSucceeded":
      return [model, Cmd.None, []];

    case "ClickedEmailLogin":
      return [model, Route.push({ type: "LoginEmail" }), []];
  }
};

//
//
//
// View
//
//
//

export const view =
  (model: Model): View.View<Msg> =>
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
          loading={
            model.type === "LoggingIn" && model.loginMethod.type === "Google"
          }
          disabled={model.type === "LoggingIn"}
          fullWidth
          startIcon={
            //todo fix this hack
            model.type === "LoggingIn" ? undefined : <View.Icons.GoogleAlt />
          }
          color="inherit"
          sx={{
            color: (theme) => theme.palette.grey[800],
            marginBottom: 2,
          }}
          onClick={() => {
            dispatch({ type: "ClickedGoogleLogin" });
          }}
        >
          Continue With Google
        </View.Button>

        <View.Button
          variant="contained"
          size="large"
          fullWidth
          // startIcon={<View.Icons.Email />}
          color="primary"
          sx={{ marginBottom: 1 }}
          onClick={() => {
            dispatch({ type: "ClickedEmailLogin" });
          }}
        >
          Continue With Email
        </View.Button>
      </View.Page>
    );
