import * as Store from "Store"
import * as View from "View"
import { Cmd, Navigation } from "Core"

//
//
//
// Model
//
//
//

export type Model = { name: string }

export const init = ({ name }: { name: string }): Model => {
  return {
    name,
  }
}

//
//
//
// Update
//
//
//

export type Msg =
  | { type: "UserEnteredName"; name: string }
  | { type: "UserClickedCancelButton" }
  | { type: "UserClickedSubmitButton" }

type Action = Store.GroupedMsg

export const update = (
  { userId }: { userId: string },
  msg: Msg,
  model: Model,
): [Model, Cmd.Cmd<Msg>, Action[]] => {
  switch (msg.type) {
    case "UserEnteredName":
      return [{ ...model, ...msg }, Cmd.none, []]

    case "UserClickedSubmitButton":
      return [
        model,
        Navigation.back(),
        [Store.Profile.Edit(userId, { name: model.name })],
      ]

    case "UserClickedCancelButton":
      return [model, Navigation.back(), []]
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
  (model: Model): View.View<Msg> =>
  (dispatch) =>
    (
      <View.Page>
        <View.Header
          left={
            <View.Button
              sx={{ marginLeft: -1 }}
              onClick={() => dispatch({ type: "UserClickedCancelButton" })}
            >
              Cancel
            </View.Button>
          }
          title="Name"
          right={
            <View.Button
              sx={{ marginRight: -1 }}
              onClick={() => dispatch({ type: "UserClickedSubmitButton" })}
            >
              Done
            </View.Button>
          }
        />

        <View.Box sx={{ padding: 2 }}>
          <View.TextField
            value={model.name}
            sx={{ marginBottom: 4 }}
            label="Name"
            fullWidth
            onChange={(event) =>
              dispatch({
                type: "UserEnteredName",
                name: event.currentTarget.value,
              })
            }
          />
        </View.Box>
      </View.Page>
    )
