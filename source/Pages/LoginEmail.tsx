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
  password: string
  passwordVisibility: Visibility
  submission:
    | { type: "Idle" }
    | { type: "Loading" }
    | { type: "Problem"; message: string }
}

type Visibility = "Showing" | "Hiding"

//
//
//
// Init
//
//
//

export const init: Model = {
  submission: { type: "Idle" },
  passwordVisibility: "Hiding",
  emailAddress: "",
  password: "",
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
  | ["ClickedTogglePasswordVisibility"]
  | ["ClickedLogin"]
  | ["ClickedCreateAccount"]
  | ["ClickedResetPassword"]
  | ["InputtedEmailAddress", string]
  | ["InputtedPassword", string]
  | ["FocusResulted", Browser.FocusResult]
  | ["LoginResulted", Auth.LoginResult]

const passwordFieldId = "password"

export const update = (msg: Msg, model: Model): [Model, Cmd.Cmd<Msg>] => {
  switch (msg[0]) {
    case "InputtedEmailAddress":
      return [{ ...model, emailAddress: msg[1] }, Cmd.None]

    case "InputtedPassword": {
      return [{ ...model, password: msg[1] }, Cmd.None]
    }

    case "ClickedTogglePasswordVisibility":
      return [
        {
          ...model,
          passwordVisibility: toggleVisibility(model.passwordVisibility),
        },
        pipe(
          Browser.focus(passwordFieldId),
          Cmd.fromTask((result) => ["FocusResulted", result]),
        ),
      ]

    case "FocusResulted":
      return [model, Cmd.None]

    case "ClickedLogin":
      return [
        {
          ...model,
          submission: { type: "Loading" },
        },
        pipe(
          Auth.loginWithEmailAndPassword({
            emailAddress: model.emailAddress,
            password: model.password,
          }),
          Cmd.fromTask((result) => ["LoginResulted", result]),
        ),
      ]

    case "LoginResulted":
      switch (msg[1].type) {
        case "Err":
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

        case "Ok":
          return [model, Cmd.None]
      }

    case "ClickedCreateAccount":
      return [model, Route.push({ type: "AccountCreate" })]

    case "ClickedResetPassword":
      return [model, Route.push({ type: "PasswordReset" })]

    case "ClickedBack":
      return [model, Route.back]

    default:
      return exhaustive(msg[0])
  }
}

const toggleVisibility = (visibility: Visibility): Visibility => {
  switch (visibility) {
    case "Hiding":
      return "Showing"

    case "Showing":
      return "Hiding"
  }
}

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
      <UI.FillBox>
        <UI.Header
          left={
            <UI.HeaderBackButton onClick={() => dispatch(["ClickedBack"])} />
          }
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
              dispatch(["InputtedEmailAddress", event.target.value])
            }}
          />

          <UI.TextField
            sx={{ marginBottom: 2 }}
            id={passwordFieldId}
            type={model.passwordVisibility === "Hiding" ? "password" : "text"}
            fullWidth
            label="Password"
            value={model.password}
            onChange={(event) => {
              dispatch(["InputtedPassword", event.target.value])
            }}
            InputProps={{
              endAdornment: (
                <UI.InputAdornment position="end">
                  <UI.Button
                    onClick={() =>
                      dispatch(["ClickedTogglePasswordVisibility"])
                    }
                  >
                    {model.passwordVisibility === "Hiding" ? "Show" : "Hide"}
                  </UI.Button>
                </UI.InputAdornment>
              ),
            }}
          />

          <UI.Button
            variant="contained"
            size="large"
            fullWidth
            loading={model.submission.type === "Loading"}
            onClick={() => dispatch(["ClickedLogin"])}
          >
            Login
          </UI.Button>

          {model.submission.type === "Problem" && (
            <UI.Alert
              severity="error"
              sx={{ marginTop: 2 }}
            >
              {model.submission.message}
            </UI.Alert>
          )}

          <UI.Box sx={{ flex: 1 }} />

          <UI.Typography
            align="center"
            color="text.secondary"
          >
            Don't have an account?
          </UI.Typography>

          <UI.Button
            sx={{ marginBottom: 2 }}
            onClick={() => dispatch(["ClickedCreateAccount"])}
          >
            Create Account
          </UI.Button>
          <UI.Typography
            align="center"
            color="text.secondary"
          >
            Forgot password?
          </UI.Typography>

          <UI.Button onClick={() => dispatch(["ClickedResetPassword"])}>
            Reset Password
          </UI.Button>
        </UI.Box>
      </UI.FillBox>
    )
  }
