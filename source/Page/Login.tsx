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
  | ["LoginWithProvider_Done", Auth.LoginResult]

export const update = (msg: Msg, model: Model): [Model, Cmd.Cmd<Msg>] => {
  switch (msg[0]) {
    case "ClickedEmailLogin":
      return [model, Route.push(["LoginEmailPassword"])]

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

export const View =
  ({ model, dispatch }: { model: Model, dispatch: (msg: Msg) => void }) =>
  (
    <UI.FillBox
      sx={{
        alignItems: "center",
        justifyContent: "center",
        p: 2,
      }}
    >
      <UI.Typography
        variant="h1"
        sx={{ marginBottom: 2 }}
      >
        Gamezilla
      </UI.Typography>

      <ContinueWithGoogleButton
        isLoading={
          model[0] === "LoggingInWithProvider" && model[1] === "Google"
        }
        onClick={() => dispatch(["ClickedGoogleLogin"])}
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
        onClick={() => dispatch(["ClickedEmailLogin"])}
      >
        Continue With Email
      </UI.Button>
    </UI.FillBox>
  )

const ContinueWithGoogleButton = ({
  onClick,
  isLoading,
}: {
  onClick: () => void
  isLoading: boolean
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
  )
}
