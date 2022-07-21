import * as Route from "../Route"
import * as Store from "../Store"
import * as UI from "../UI"
import { Cmd, RemoteData } from "../Core"

//
//
//
// Model
//
//
//

export type Model = {}

export const init: [Model, Cmd.Cmd<Msg>, OutAction[]] = [{}, Cmd.None, []]

//
//
//
// Update
//
//
//

export type Msg =
  | ["ClickedCancel"]
  | ["ClickedBackdrop"]
  | ["ClickedDelete"]
  | ["ClickedCloseFailure"]

export type OutAction = Store.Action

export const update = (
  { userId }: { userId: string },
  msg: Msg,
  model: Model,
): [Model, Cmd.Cmd<Msg>, OutAction[]] => {
  switch (msg[0]) {
    case "ClickedCancel":
      return [model, Route.back, []]

    case "ClickedBackdrop":
      return [model, Route.back, []]

    case "ClickedDelete":
      return [
        model,
        Cmd.None,
        [["Store", ["Profile", ["DeleteForever", { userId }]]]],
      ]

    case "ClickedCloseFailure":
      return [model, Cmd.None, [["Store", ["Profile", ["ResetMutations"]]]]]
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
  (
    { store, profileId }: { store: Store.Model; profileId: string },
    _: Model,
  ): UI.View<Msg> =>
  (dispatch) => {
    const mutation =
      store.mutations.Profile.DeleteForever[profileId] ?? RemoteData.NotAsked

    switch (mutation.type) {
      case "Loading":
        return <UI.LoadingDialog open title="Deleting profile..." />

      case "Failure":
        return (
          <UI.Backdrop open>
            <UI.Alert variant="filled" severity="error" sx={{ margin: 2 }}>
              <UI.AlertTitle>Failed to delete profile.</UI.AlertTitle>
              {mutation.problem.message}
              <UI.Box
                sx={{
                  display: "flex",
                  justifyContent: "flex-end",
                  marginTop: 2,
                }}
              >
                <UI.Button
                  variant="outlined"
                  size="large"
                  color="inherit"
                  startIcon={<UI.Icons.Close />}
                  onClick={() => dispatch(["ClickedCloseFailure"])}
                >
                  Close
                </UI.Button>
              </UI.Box>
            </UI.Alert>
          </UI.Backdrop>
        )

      case "NotAsked":
      case "Success":
        return UI.conformationDialog<Msg>({
          open: true,
          title: "Delete profile forever?",
          confirmTitle: "Delete",
          onCancel: ["ClickedCancel"],
          onClose: ["ClickedBackdrop"],
          onConfirm: ["ClickedDelete"],
        })(dispatch)
    }
  }
