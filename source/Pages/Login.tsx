import * as Route from "Route";
import * as Session from "Session";
import * as UI from "UI";
import { Cmd, Option, pipe } from "Core";

//
//
//
// Model
//
//
//

export type Model =
  | { type: "Idle" }
  | { type: "LoggingInWithProvider"; provider: Session.Provider };

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
  | { type: "LoginWithProviderResulted"; result: Session.LoginResult };

export const update = (msg: Msg, model: Model): [Model, Cmd.Cmd<Msg>] => {
  switch (msg.type) {
    case "ClickedEmailLogin":
      return [model, Route.push({ type: "LoginEmail" })];

    case "ClickedGoogleLogin":
      return [
        { type: "LoggingInWithProvider", provider: "Google" },
        pipe(
          Session.loginWithProvider({ provider: "Google" }),
          Cmd.fromTask((result) => ({
            type: "LoginWithProviderResulted",
            result,
          })),
        ),
      ];

    case "LoginWithProviderResulted":
      switch (msg.result.type) {
        case "Err":
          return [{ type: "Idle" }, Cmd.None];

        case "Ok":
          return [model, Cmd.None];
      }
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
  (model: Model): UI.View<Msg> =>
  (dispatch) =>
    (
      <UI.Page
        sx={{
          alignItems: "center",
          justifyContent: "center",
          p: 2,
        }}
      >
        <UI.Typography variant="h1" sx={{ marginBottom: 2 }}>
          Gamezilla
        </UI.Typography>

        <ContinueWithGoogleButton
          isLoading={
            model.type === "LoggingInWithProvider" &&
            model.provider === "Google"
          }
          onClick={() => dispatch({ type: "ClickedGoogleLogin" })}
        />

        <UI.Typography
          sx={{ marginY: 1 }}
          align="center"
          color="text.secondary"
        >
          Or
        </UI.Typography>

        <UI.Button
          variant="contained"
          size="large"
          fullWidth
          color="primary"
          onClick={() => dispatch({ type: "ClickedEmailLogin" })}
        >
          Continue With Email
        </UI.Button>
      </UI.Page>
    );

const ContinueWithGoogleButton = ({
  onClick,
  isLoading,
}: {
  onClick: () => void;
  isLoading: boolean;
}) => {
  return (
    <UI.Button
      variant="contained"
      size="large"
      loading={isLoading}
      //todo fix this hack
      disabled={isLoading}
      fullWidth
      startIcon={
        //todo fix this hack
        isLoading ? undefined : <UI.Icons.GoogleAlt />
      }
      color={
        //todo fix this hack
        isLoading ? undefined : "inherit"
      }
      sx={{
        //todo fix this hack
        color: (theme) => (isLoading ? undefined : theme.palette.grey[800]),
      }}
      onClick={onClick}
    >
      Continue With Google
    </UI.Button>
  );
};
