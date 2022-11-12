import { Cmd } from "../Core"
import { UserId } from "../Data"
import * as Route from "../Route"
import * as ProfileStore from "./Profile.Store"
import * as UI from "../UI"

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
  | ["InputtedName", string]
  | ["ClickedCancel"]
  | ["ClickedSubmit"]

export type OutAction = ProfileStore.Action

export const update = (
  { userId }: { userId: UserId.UserId },
  msg: Msg,
  model: Model,
): [Model, Cmd.Cmd<Msg>, OutAction[]] => {
  switch (msg[0]) {
    case "InputtedName":
      return [{ ...model, name: msg[1] }, Cmd.None, []]

    case "ClickedSubmit":
      return [
        model,
        Route.back,
        [["Profile", ["EditOne", { userId, edits: { name: model.name } }]]],
      ]

    case "ClickedCancel":
      return [model, Route.back, []]
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
}) => (
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
      title="Name"
      right={
        <UI.Button
          sx={{ marginRight: -1 }}
          onClick={() => dispatch(["ClickedSubmit"])}
        >
          Done
        </UI.Button>
      }
    />

    <UI.Box sx={{ padding: 2 }}>
      <UI.TextField
        value={model.name}
        sx={{ marginBottom: 4 }}
        label="Name"
        fullWidth
        onChange={(event) =>
          dispatch(["InputtedName", event.currentTarget.value])
        }
      />
    </UI.Box>
  </UI.FillBox>
)
