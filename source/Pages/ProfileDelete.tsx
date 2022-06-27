import * as Route from "Route"
import * as Store from "Store"
import * as View from "View"
import { Cmd } from "Core"

//
//
//
// Model
//
//
//

export type Model = {}

export const init: Model = {}

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

export type Action = Store.Action

export const update = (
  { userId }: { userId: string },
  msg: Msg,
  model: Model,
): [Model, Cmd.Cmd<Msg>, Action[]] => {
  switch (msg.type) {
    case "UserClickedCancelButton":
      return [model, Route.back(), []]

    case "UserClickedBackdrop":
      return [model, Route.back(), []]

    case "UserClickedDeleteButton":
      return [model, Cmd.none, [Store.Profile.DeleteForever(userId)]]
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
    const mutation = Store.Profile.toDeleteForeverMutation(profileId, store)

    switch (mutation.type) {
      case "Loading":
        return <View.LoadingDialog open title="Deleting profile..." />

      case "Failure":
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
