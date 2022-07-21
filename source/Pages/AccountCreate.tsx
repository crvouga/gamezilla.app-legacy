import { Browser, Cmd, exhaustive, pipe } from "../Core"
import { EmailAddress, Password } from "../Data"
import * as Route from "../Route"
import * as Store from "../Store"
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
  password: string
  passwordVisibility: Visibility
  submission:
    | { type: "NotAsked" }
    | { type: "Loading" }
    | {
        type: "ProblemValidation"
        emailAddress: Problem[]
        password: Problem[]
      }
    | { type: "Problem"; message: string }
    | { type: "Succeeded" }
}

type Visibility = "Showing" | "Hiding"

type Problem = { message: string }

//
//
//
// Init
//
//
//

export const init = (): [Model, Cmd.Cmd<Msg>] => {
  return [
    {
      submission: { type: "NotAsked" },
      emailAddress: "",
      password: "",
      passwordVisibility: "Hiding",
    },
    Cmd.None,
  ]
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
  | ["ClickedLogin"]
  | ["ClickedTogglePasswordVisibility"]
  | ["ClickedCreateAccount"]
  | ["InputtedEmailAddress", string]
  | ["InputtedPassword", string]
  | ["CreateAccountResulted", Store.Account.CreateResult]
  | ["FocusResulted", Browser.FocusResult]

const emailAddressId = "emailAddress"
const passwordId = "password"

export const update = (msg: Msg, model: Model): [Model, Cmd.Cmd<Msg>] => {
  switch (msg[0]) {
    case "ClickedBack":
      return [model, Route.back]

    case "InputtedPassword": {
      return [
        {
          ...model,
          submission:
            model.submission.type === "ProblemValidation"
              ? { ...model.submission, password: [] }
              : model.submission,
          password: msg[1],
        },
        Cmd.None,
      ]
    }

    case "InputtedEmailAddress": {
      return [
        {
          ...model,
          submission:
            model.submission.type === "ProblemValidation"
              ? { ...model.submission, emailAddress: [] }
              : model.submission,
          emailAddress: msg[1],
        },
        Cmd.None,
      ]
    }

    case "FocusResulted":
      return [model, Cmd.None]

    case "ClickedTogglePasswordVisibility":
      return [
        {
          ...model,
          passwordVisibility: toggleVisibility(model.passwordVisibility),
        },
        pipe(
          Browser.focus(passwordId),
          Cmd.fromTask((result) => ["FocusResulted", result]),
        ),
      ]

    case "ClickedCreateAccount": {
      const emailAddress = EmailAddress.decode(model.emailAddress)
      const password = Password.decode(model.password)

      if (emailAddress.type === "Err" || password.type === "Err") {
        const submissionNew: Model["submission"] = {
          type: "ProblemValidation",
          emailAddress: emailAddress.type === "Err" ? [emailAddress.error] : [],
          password: password.type === "Err" ? [password.error] : [],
        }

        const focusId =
          submissionNew.emailAddress.length > 0 ? emailAddressId : passwordId

        return [
          { ...model, submission: submissionNew },
          pipe(
            Browser.focus(focusId),
            Cmd.fromTask((result) => ["FocusResulted", result]),
          ),
        ]
      }

      return [
        { ...model, submission: { type: "Loading" } },
        pipe(
          Store.Account.createWithEmailAndPassword({
            emailAddress: emailAddress.value,
            password: password.value,
          }),
          Cmd.fromTask((result) => ["CreateAccountResulted", result]),
        ),
      ]
    }

    case "CreateAccountResulted": {
      const result = msg[1]
      switch (result.type) {
        case "Err":
          return [
            {
              ...model,
              submission: {
                type: "Problem",
                message: result.error.message,
              },
            },
            Cmd.None,
          ]

        case "Ok":
          return [{ ...model, submission: { type: "Succeeded" } }, Cmd.None]

        default:
          return exhaustive(result)
      }
    }

    case "ClickedLogin": {
      return [model, Route.push({ type: "Login" })]
    }

    default:
      return exhaustive(msg[0])
  }
}

const toggleVisibility = (visibility: Visibility): Visibility => {
  switch (visibility) {
    case "Hiding": {
      return "Showing"
    }

    case "Showing": {
      return "Hiding"
    }
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
          title="Create Account"
        />

        <UI.Box
          sx={{ padding: 2, flex: 1, display: "flex", flexDirection: "column" }}
        >
          <UI.TextField
            id={emailAddressId}
            autoFocus
            sx={{ marginBottom: 2 }}
            type="email"
            fullWidth
            inputMode="email"
            label="Email Address"
            value={model.emailAddress}
            onChange={(event) =>
              dispatch(["InputtedEmailAddress", event.target.value])
            }
            error={
              model.submission.type === "ProblemValidation" &&
              model.submission.emailAddress.length > 0
            }
            helperText={
              model.submission.type === "ProblemValidation"
                ? model.submission.emailAddress[0]?.message ?? ""
                : ""
            }
          />

          <UI.TextField
            id={passwordId}
            sx={{ marginBottom: 2 }}
            type={model.passwordVisibility === "Hiding" ? "password" : "text"}
            fullWidth
            label="Password"
            value={model.password}
            onChange={(event) =>
              dispatch(["InputtedPassword", event.target.value])
            }
            error={
              model.submission.type === "ProblemValidation" &&
              model.submission.password.length > 0
            }
            helperText={
              model.submission.type === "ProblemValidation"
                ? model.submission.password[0]?.message ?? ""
                : ""
            }
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
            loading={model.submission.type === "Loading"}
            onClick={() => dispatch(["ClickedCreateAccount"])}
          >
            Create Account
          </UI.Button>

          {model.submission.type === "Problem" && (
            <UI.Alert severity="error" sx={{ marginTop: 2 }}>
              {model.submission.message}
            </UI.Alert>
          )}

          <UI.Box sx={{ flex: 1 }} />
          <UI.Typography align="center" color="text.secondary">
            Already have an account?
          </UI.Typography>
          <UI.Button onClick={() => dispatch(["ClickedLogin"])}>
            Login
          </UI.Button>
        </UI.Box>
      </UI.FillBox>
    )
  }
