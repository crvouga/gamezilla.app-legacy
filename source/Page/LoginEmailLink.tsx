import * as Route from "../Route"
import * as Auth from "../Auth"
import * as UI from "../UI"
import { Browser, Cmd, exhaustive, pipe } from "../Core"

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
    | { type: "Loading" }
    | { type: "Problem"; message: string }
}

//
//
//
// Init
//
//
//

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
  | ["InputEmailAddress", string]
  | ["Login_Done", Auth.LoginResult]

export const update = (msg: Msg, model: Model): [Model, Cmd.Cmd<Msg>] => {
  switch (msg[0]) {
    case "InputEmailAddress":
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
          return [model, Cmd.None]
        }
      }
    }

    case "ClickedSendLoginLink": {
      return [model, Cmd.None]
    }

    case "ClickedBack":
      return [model, Route.back]

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
  dispatch,
}: {
  model: Model
  dispatch: (msg: Msg) => void
}) => {
  return (
    <UI.FillBox>
      <UI.Header
        left={<UI.HeaderBackButton onClick={() => dispatch(["ClickedBack"])} />}
        title="Continue With Email"
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
            dispatch(["InputEmailAddress", event.target.value])
          }}
        />

        <UI.Button
          variant="contained"
          size="large"
          fullWidth
          loading={model.submission.type === "Loading"}
          onClick={() => dispatch(["ClickedSendLoginLink"])}
        >
          Send Login Link
        </UI.Button>

        {model.submission.type === "Problem" && (
          <UI.Alert
            severity="error"
            sx={{ marginTop: 2 }}
          >
            {model.submission.message}
          </UI.Alert>
        )}
      </UI.Box>
    </UI.FillBox>
  )
}
