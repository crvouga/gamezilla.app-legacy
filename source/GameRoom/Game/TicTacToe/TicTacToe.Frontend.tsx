import { Cmd } from "../../../Core"
import { UserId } from "../../../Data"
import { TicTacToe } from "../../../Games"
import * as Store from "../../../Store"
import * as UI from "../../../UI"
import { FrontendModel, FrontendMsg, ToFrontend } from "./TicTacToe.Types"

//
//
//
// Model
//
//
//

export type Model = FrontendModel

//
//
// Update
//
//
//

export type Msg = FrontendMsg

export type OutAction = Store.Action

export const update = (
  { currentUserId }: { currentUserId: UserId.UserId },
  msg: Msg,
  model: Model,
): [Model, Cmd.Cmd<Msg>] => {
  return [model, Cmd.None]
}

export const updateFromBackend = (
  msg: ToFrontend,
  model: Model,
): [Model, Cmd.Cmd<Msg>, OutAction[]] => {
  return [model, Cmd.None, []]
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
    {
      currentUserId,
      store,
    }: {
      currentUserId: UserId.UserId
      store: Store.Model
    },
    model: Model,
  ): UI.View<Msg> =>
  (dispatch) => {
    return (
      <UI.FillBox>
        <TicTacToe.ViewBoard
          board={model.board}
          onClick={() => {}}
        />
      </UI.FillBox>
    )
  }
