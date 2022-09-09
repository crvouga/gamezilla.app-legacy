import * as Route from "../Route"
import * as Auth from "../Auth"
import * as UI from "../UI"
import { Cmd, pipe } from "../Core"

//
//
//
// Model
//
//
//

export type Model = ["Idle"] | ["LoggingInWithProvider", Auth.Provider]

export const init: Model = ["Idle"]

//
//
//
// Update
//
//
//

export type Msg =
  | ["ClickedGoogleLogin"]
  | ["ClickedEmailLogin"]
  | ["ClickedPhoneLogin"]
  | ["LoginWithProvider_Done", Auth.AuthResult]

export const update = (msg: Msg, model: Model): [Model, Cmd.Cmd<Msg>] => {
  switch (msg[0]) {
    case "ClickedEmailLogin":
      return [model, Route.push(["LoginEmailLink"])]

    case "ClickedPhoneLogin":
      return [model, Route.push(["LoginPhone"])]

    case "ClickedGoogleLogin":
      return [
        ["LoggingInWithProvider", "Google"],
        pipe(
          Auth.loginWithProvider({ provider: "Google" }),
          Cmd.perform((result) => ["LoginWithProvider_Done", result]),
        ),
      ]

    case "LoginWithProvider_Done":
      switch (msg[1].type) {
        case "Err":
          return [["Idle"], Cmd.None]

        case "Ok":
          return [model, Cmd.None]
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

export const View = ({
  model,
  dispatch,
}: {
  model: Model
  dispatch: (msg: Msg) => void
}) => {
  const isGoogleLoading =
    model[0] === "LoggingInWithProvider" && model[1] === "Google"
  return (
    <UI.FillBox
      sx={{
        alignItems: "center",
        justifyContent: "center",
        p: 2,
        gap: 3,
      }}
    >
      <UI.Typography variant="h1">Gamezilla</UI.Typography>

      <UI.Button
        variant="contained"
        size="large"
        loading={isGoogleLoading}
        //todo fix this hack
        disabled={isGoogleLoading}
        fullWidth
        startIcon={
          //todo fix this hack
          isGoogleLoading ? undefined : <UI.Icons.GoogleAlt />
        }
        color={
          //todo fix this hack
          isGoogleLoading ? undefined : "inherit"
        }
        sx={{
          //todo fix this hack
          color: (theme) =>
            isGoogleLoading ? undefined : theme.palette.grey[800],
        }}
        onClick={() => dispatch(["ClickedGoogleLogin"])}
      >
        Continue With Google
      </UI.Button>

      <UI.Button
        variant="contained"
        size="large"
        fullWidth
        color="primary"
        onClick={() => dispatch(["ClickedPhoneLogin"])}
        startIcon={<UI.Icons.PhoneAndroid />}
      >
        Continue With Phone
      </UI.Button>

      <UI.Button
        variant="contained"
        size="large"
        fullWidth
        color="primary"
        onClick={() => dispatch(["ClickedEmailLogin"])}
        startIcon={<UI.Icons.Email />}
      >
        Continue With Email
      </UI.Button>

    </UI.FillBox>
  )
}
