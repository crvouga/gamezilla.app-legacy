import * as Route from "Route"
import * as Store from "Store"
import * as View from "View"
import { Cmd, RemoteData } from "Core"

//
//
//
// Model
//
//
//

export type Model = {}

export const init: [Model, Cmd.Cmd<Msg>, OutAction[]] = [{}, Cmd.none, []]

//
//
//
// Update
//
//
//

export type Msg =
  | { type: "UserClickedCancelButton" }
  | { type: "UserClickedBackdrop" }
  | { type: "UserClickedDeleteButton" }
  | { type: "ClickedCloseFailureAlert" }

export type OutAction = Store.Action

export const update = (
  { userId }: { userId: string },
  msg: Msg,
  model: Model,
): [Model, Cmd.Cmd<Msg>, OutAction[]] => {
  switch (msg.type) {
    case "UserClickedCancelButton":
      return [model, Route.back(), []]

    case "UserClickedBackdrop":
      return [model, Route.back(), []]

    case "UserClickedDeleteButton":
      return [model, Cmd.none, [Store.Profile.DeleteForever(userId)]]

    case "ClickedCloseFailureAlert":
      return [model, Cmd.none, [Store.Profile.ResetMutations()]]
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
    model: Model,
  ): View.View<Msg> =>
  (dispatch) => {
    const mutation =
      store.mutations.Profile.DeleteForever[profileId] ?? RemoteData.NotAsked

    switch (mutation.type) {
      case "Loading":
        return <View.LoadingDialog open title="Deleting profile..." />

      case "Failure":
        return (
          <View.Backdrop open>
            <View.Alert variant="filled" severity="error" sx={{ margin: 2 }}>
              <View.AlertTitle>Failed to delete profile.</View.AlertTitle>
              {mutation.problem.message}
              <View.Box
                sx={{
                  display: "flex",
                  justifyContent: "flex-end",
                  marginTop: 2,
                }}
              >
                <View.Button
                  variant="outlined"
                  size="large"
                  color="inherit"
                  startIcon={<View.Icons.Close />}
                  onClick={() => dispatch({ type: "ClickedCloseFailureAlert" })}
                >
                  Close
                </View.Button>
              </View.Box>
            </View.Alert>
          </View.Backdrop>
        )

      case "NotAsked":
      case "Success":
        return (
          <View.ConformationDialog
            open
            title="Delete profile forever?"
            onClose={() => dispatch({ type: "UserClickedBackdrop" })}
            onCancel={() => dispatch({ type: "UserClickedCancelButton" })}
            confirmTitle="Delete"
            onConfirm={() => dispatch({ type: "UserClickedDeleteButton" })}
          />
        )
    }
  }
