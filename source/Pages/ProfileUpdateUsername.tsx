import * as Route from "../Route"
import * as Store from "../Store"
import * as UI from "../UI"
import { Cmd } from "../Core"

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
  | ["ClickedCancel"]
  | ["ClickedSubmit"]
  | ["InputtedUsername", string]

type OutAction = Store.Action

export const update = (
  { userId }: { userId: string },
  msg: Msg,
  model: Model,
): [Model, Cmd.Cmd<Msg>, OutAction[]] => {
  switch (msg[0]) {
    case "InputtedUsername":
      return [{ ...model, username: msg[1] }, Cmd.None, []]

    case "ClickedCancel":
      return [model, Route.back, []]

    case "ClickedSubmit":
      return [
        model,
        Route.back,
        [
          [
            "Store",
            [
              "Profile",
              ["Edit", { userId, edits: { username: model.username } }],
            ],
          ],
        ],
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
  (model: Model): UI.View<Msg> =>
  (dispatch) =>
    (
      <UI.FillBox>
        <UI.Header
          left={
            <UI.Button
              sx={{ marginLeft: -1 }}
              onClick={() => dispatch(["ClickedCancel"])}
            >
              Cancel
            </UI.Button>
          }
          title="Username"
          right={
            <UI.Button
              sx={{ marginRight: -1 }}
              onClick={() => dispatch(["ClickedSubmit"])}
            >
              Done
            </UI.Button>
          }
        />

        <UI.Box sx={{ p: 2, width: "100%" }}>
          <UI.TextField
            value={model.username}
            sx={{ marginBottom: 4 }}
            label="Username"
            fullWidth
            onChange={(event) =>
              dispatch(["InputtedUsername", event.currentTarget.value])
            }
          />
        </UI.Box>
      </UI.FillBox>
    )
