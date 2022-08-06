import { Cmd } from "../Core"
import { UserId } from "../Data"
import * as Games from "../Games/Frontend"
import * as RoomId from "../Games/RoomId"
import * as Route from "../Route"
import * as Store from "../Store"
import * as UI from "../UI"

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

export type Msg = ["ClickedPlay"]

export type OutAction = Games.Action

export const update = (
  { currentUserId }: { currentUserId: UserId.UserId },
  msg: Msg,
  model: Model,
): [Model, Cmd.Cmd<Msg>, OutAction[]] => {
  switch (msg[0]) {
    case "ClickedPlay": {
      return [model, Route.push({ type: "GameRoom" }), []]
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

export const view = (
  {
    currentUserId,
    games,
    store,
  }: {
    currentUserId: UserId.UserId
    games: Games.Model
    store: Store.Model
  },
  _model: Model,
): UI.View<Msg> => {
  return (dispatch) => {
    return (
      <UI.FillBox>
        <UI.Header title="Home" />
        <UI.Box sx={{ paddingX: 2 }}>
          <UI.Button
            fullWidth
            size="large"
            variant="contained"
            onClick={() => dispatch(["ClickedPlay"])}
          >
            Play
          </UI.Button>
        </UI.Box>
      </UI.FillBox>
    )
  }
}
