import { Cmd } from "../../../Core"
import { ConnectFour } from "../../../Games"
import * as UI from "../../../UI"
import { FrontendModel, FrontendMsg, ToBackend, ToFrontend } from "./ConnectFour.Types"

//
//
//
// Model
//
//
//

export type Model = FrontendModel

export const init: Model = {
  columns: ConnectFour.emptyColumns,
}

//
//
//
// Update
//
//
//

export type Msg = FrontendMsg

export const update = (msg: Msg, model: Model): [Model, Cmd.Cmd<Msg>] => {
  return [model, Cmd.None]
}

export const updateFromBackend = (msg: ToFrontend, model: Model): [Model, Cmd.Cmd<Msg>] => {
  return [model, Cmd.None]
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
        <ConnectFour.ViewColumns
          columns={model.columns}
          onClick={(columnIndex) => {}}
        />
      </UI.FillBox>
    )
