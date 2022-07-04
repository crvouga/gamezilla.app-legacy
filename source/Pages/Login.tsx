import * as Route from "Route";
import * as Session from "Session";
import * as View from "View";
import { Cmd } from "Core";

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

        <ContinueWithGoogleButton
          isLoading={
            model.type === "LoggingIn" && model.loginMethod.type === "Google"
          }
          onClick={() => dispatch({ type: "ClickedGoogleLogin" })}
        />

        <View.Typography
          sx={{ marginY: 2 }}
          align="center"
          color="text.secondary"
        >
          Or
        </View.Typography>

        <View.Button
          variant="contained"
          size="large"
          fullWidth
          color="primary"
          onClick={() => dispatch({ type: "ClickedEmailLogin" })}
        >
          Continue With Email
        </View.Button>
      </View.Page>
    );

const ContinueWithGoogleButton = ({
  onClick,
  isLoading,
}: {
  onClick: () => void;
  isLoading: boolean;
}) => {
  return (
    <View.Button
      variant="contained"
      size="large"
      loading={isLoading}
      disabled={isLoading}
      fullWidth
      startIcon={
        //todo fix this hack
        isLoading ? undefined : <View.Icons.GoogleAlt />
      }
      color={
        //todo fix this hack
        isLoading ? undefined : "inherit"
      }
      sx={{
        color: (theme) => theme.palette.grey[800],
      }}
      onClick={onClick}
    >
      Continue With Google
    </View.Button>
  );
};
