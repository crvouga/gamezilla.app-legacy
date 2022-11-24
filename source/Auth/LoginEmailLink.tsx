import * as Auth from "../Auth/Auth"
import { Cmd, exhaustive, p, t } from "../Core"
import * as Route from "../Route"
import * as UI from "../UI"

//
//
//
// Model
//
//
//

export type Model = {
  emailAddress: string
  submission:
    | { type: "Idle" }
    | { type: "Loading"; sentToEmailAddress: string }
    | { type: "Problem"; message: string }
    | { type: "Ok"; sentToEmailAddress: string }
}

export const init: Model = {
  emailAddress: "",
  submission: { type: "Idle" },
}

//
//
//
// Update
//
//
//

export type Msg =
  | ["ClickedBack"]
  | ["ClickedSendLoginLink"]
  | ["InputtedEmailAddress", string]
  | ["Login_Done", Auth.AuthResult]

export const update = (msg: Msg, model: Model): [Model, Cmd<Msg>] => {
  switch (msg[0]) {
    case "InputtedEmailAddress":
      return [{ ...model, emailAddress: msg[1] }, Cmd.None]

    case "Login_Done": {
      switch (msg[1].type) {
        case "Err": {
          return [
            {
              ...model,
              submission: {
                type: "Problem",
                message: msg[1].error.message,
              },
            },
            Cmd.None,
          ]
        }

        case "Ok": {
          const emailAddress =
            model.submission.type === "Loading"
              ? model.submission.sentToEmailAddress
              : model.emailAddress
          return [
            {
              ...model,
              emailAddress: "",
              submission: { type: "Ok", sentToEmailAddress: emailAddress },
            },
            Cmd.None,
          ]
        }
      }
    }

    case "ClickedSendLoginLink": {
      return [
        {
          ...model,
          submission: {
            type: "Loading",
            sentToEmailAddress: model.emailAddress,
          },
        },
        p(
          Auth.loginWithEmailLink({ emailAddress: model.emailAddress }),
          Cmd.perform(t("Login_Done")),
        ),
      ]
    }

    case "ClickedBack": {
      return [model, Route.back]
    }

    default:
      return exhaustive(msg[0])
  }
}

//
//
//
// View
//
//
//

export const View = ({
  model,
  $d,
}: {
  model: Model
  $d: (msg: Msg) => void
}) => {
  return (
    <UI.FillBox>
      <UI.Header
        left={<UI.HeaderBackButton onClick={() => $d(["ClickedBack"])} />}
        title="Login With Email"
      />

      <UI.Box
        sx={{
          padding: 2,
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
            $d(["InputtedEmailAddress", event.target.value])
          }}
        />

        <UI.Button
          variant="contained"
          size="large"
          fullWidth
          loading={model.submission.type === "Loading"}
          onClick={() => $d(["ClickedSendLoginLink"])}
          sx={{ marginBottom: 2 }}
        >
          Send Login Link
        </UI.Button>

        {model.submission.type === "Problem" && (
          <UI.Alert severity="error">{model.submission.message}</UI.Alert>
        )}

        {model.submission.type === "Ok" && (
          <UI.Alert severity="success">
            <UI.AlertTitle>Check your email</UI.AlertTitle>
            <UI.Typography
              color="text.secondary"
              variant="body2"
            >
              An email was sent to{" "}
              <UI.Box
                component="span"
                sx={{ color: "text.primary" }}
              >
                {model.submission.type === "Ok"
                  ? model.submission.sentToEmailAddress
                  : "the provider email address"}
              </UI.Box>
              . It has a link that will log you in.
            </UI.Typography>
          </UI.Alert>
        )}
      </UI.Box>
    </UI.FillBox>
  )
}
