import { either } from "fp-ts"
import { pipe } from "fp-ts/lib/function"
import { cmd } from "Core"
import { attempt } from "Core/Task"
import * as Session from "Session"
import * as View from "View"

//
//
//
// Model
//
//
//

export type Model =
  | { type: "Idle" }
  | { type: "LoggingIn"; loginMethod: Session.LoginMethod }

export const init: Model = { type: "Idle" }

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
  | { type: "LoginSucceeded" }

export const update = (msg: Msg, model: Model): [Model, cmd.Cmd<Msg>] => {
  switch (msg.type) {
    case "UserClickedLoginButton":
      return [
        { type: "LoggingIn", loginMethod: msg.loginMethod },
        loginCmd(msg.loginMethod),
      ]

    case "LoginFailed":
      return [{ type: "Idle" }, cmd.none]

    case "LoginSucceeded":
      return [model, cmd.none]
  }
}

const loginCmd = (loginMethod: Session.LoginMethod) => {
  return pipe(
    Session.login(loginMethod),
    attempt(
      either.fold<{}, {}, Msg>(
        () => ({ type: "LoginFailed" }),
        () => ({ type: "LoginSucceeded" })
      )
    )
  )
}

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
          loading={model.type === "LoggingIn"}
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
      </View.Page>
    )
