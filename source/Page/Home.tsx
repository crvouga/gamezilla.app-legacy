import { Cmd } from "../Core"
import { UserId } from "../Data"
import * as GameRoom from "../GameRoom/GameRoom.Frontend"
import * as Party from "../Party/Party.Frontend"
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

export type Msg = ["ClickedPlay"] | ['ClickedCreateParty']

export type OutAction = GameRoom.Action | Party.Action

export const update = (
  { currentUserId }: { currentUserId: UserId.UserId },
  msg: Msg,
  model: Model,
): [Model, Cmd.Cmd<Msg>, OutAction[]] => {
  switch (msg[0]) {
    case "ClickedPlay": {
      return [model, Route.push(["GameRoom"]), []]
    }

    case 'ClickedCreateParty': {
      const action: OutAction = ['Party', ['Msg', ['CreateParty', { hostId: currentUserId }]]]

      return [model, Cmd.None, [action]]
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
    store,
  }: {
    currentUserId: UserId.UserId
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
            sx={{ marginBottom: 2 }}
          >
            Play
          </UI.Button>

          <UI.Button
            fullWidth
            size="large"
            variant="contained"
            onClick={() => dispatch(['ClickedCreateParty'])}
          >
            Create Party
          </UI.Button>
        </UI.Box>
      </UI.FillBox>
    )
  }
}
