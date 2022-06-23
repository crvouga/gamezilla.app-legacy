import { cmd } from "Core"
import * as Navigation from "Core/Navigation"
import * as Store from "Store"
import * as View from "View"

//
//
//
// Model
//
//
//

export type Model = { username: string }

export const init = ({ username }: { username: string }): Model => {
  return {
    username,
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
  | { type: "UserClickedCancelButton" }
  | { type: "UserEnteredUsername"; username: string }
  | { type: "UserClickedSubmitButton" }

export type OutMsg = Store.GroupedMsg

export const update = (
  { userId }: { userId: string },
  msg: Msg,
  model: Model
): [Model, cmd.Cmd<Msg>, OutMsg[]] => {
  switch (msg.type) {
    case "UserEnteredUsername":
      return [{ ...model, username: msg.username }, cmd.none, []]

    case "UserClickedCancelButton":
      return [model, Navigation.back(), []]

    case "UserClickedSubmitButton":
      return [
        model,
        Navigation.back(),
        [Store.Profile.Edit(userId, { username: model.username })],
      ]
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
          title="Username"
          right={
            <View.Button
              sx={{ marginRight: -1 }}
              onClick={() => dispatch({ type: "UserClickedSubmitButton" })}
            >
              Done
            </View.Button>
          }
        />

        <View.Box sx={{ p: 2, width: "100%" }}>
          <View.TextField
            value={model.username}
            sx={{ marginBottom: 4 }}
            label="Username"
            fullWidth
            onChange={(event) =>
              dispatch({
                type: "UserEnteredUsername",
                username: event.currentTarget.value,
              })
            }
          />
        </View.Box>
      </View.Page>
    )
