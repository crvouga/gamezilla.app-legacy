import * as Route from "Route";
import * as Store from "Store";
import * as UI from "UI";
import { Cmd, pipe } from "Core";

//
//
//
// Model
//
//
//

export type Model = {
  emailAddress: string;
  submission:
    | { type: "Idle" }
    | { type: "Loading" }
    | { type: "Problem"; message: string }
    | { type: "Succeeded"; sentTo: string };
};

//
//
//
// Init
//
//
//

export const init: Model = {
  submission: { type: "Idle" },
  emailAddress: "",
};

//
//
//
// Update
//
//
//

export type Msg =
  | { type: "ClickedBack" }
  | { type: "InputtedEmailAddress"; emailAddress: string }
  | { type: "ClickedSend" }
  | {
      type: "SendResulted";
      sentTo: string;
      result: Store.Account.SendResetPasswordLinkResult;
    };

export const update = (msg: Msg, model: Model): [Model, Cmd.Cmd<Msg>] => {
  switch (msg.type) {
    case "ClickedBack":
      return [model, Route.back];

    case "InputtedEmailAddress":
      return [{ ...model, emailAddress: msg.emailAddress }, Cmd.None];

    case "ClickedSend":
      return [
        { ...model, submission: { type: "Loading" } },
        pipe(
          Store.Account.sendResetPasswordLink({
            emailAddress: model.emailAddress,
          }),
          Cmd.fromTask((result) => ({
            type: "SendResulted",
            sentTo: model.emailAddress,
            result,
          })),
        ),
      ];

    case "SendResulted":
      switch (msg.result.type) {
        case "Err":
          return [
            {
              ...model,
              submission: {
                type: "Problem",
                message: msg.result.error.message,
              },
            },
            Cmd.None,
          ];

        case "Ok":
          return [
            { ...model, submission: { type: "Succeeded", sentTo: msg.sentTo } },
            Cmd.None,
          ];
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
  (dispatch) => {
    return (
      <UI.Page>
        <UI.Header
          left={
            <UI.HeaderBackButton
              onClick={() => dispatch({ type: "ClickedBack" })}
            />
          }
          title="Reset Password"
        />

        <UI.Box
          sx={{
            padding: 2,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            flex: 1,
          }}
        >
          <UI.TextField
            autoFocus
            sx={{ marginBottom: 2 }}
            type="email"
            fullWidth
            inputMode="email"
            label="Email Address"
            value={model.emailAddress}
            onChange={(event) => {
              dispatch({
                type: "InputtedEmailAddress",
                emailAddress: event.target.value,
              });
            }}
          />

          <UI.Button
            variant="contained"
            size="large"
            fullWidth
            loading={model.submission.type === "Loading"}
            onClick={() => dispatch({ type: "ClickedSend" })}
          >
            Send Password Reset Link
          </UI.Button>

          {model.submission.type === "Problem" && (
            <UI.Alert severity="error" sx={{ marginTop: 2 }}>
              {model.submission.message}
            </UI.Alert>
          )}
          {model.submission.type === "Succeeded" && (
            <UI.Alert severity="success" sx={{ marginTop: 2 }}>
              Password reset link was sent to {model.submission.sentTo}
            </UI.Alert>
          )}
          <UI.Box sx={{ flex: 1 }} />
        </UI.Box>
      </UI.Page>
    );
  };
