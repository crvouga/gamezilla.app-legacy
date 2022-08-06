import { Cmd, pipe, Sub, tag } from "../../Core"
import { UserId } from "../../Data"
import * as UI from "../../UI"
import * as Store from "../../Store"
import { GameFrontendModel, GameFrontendMsg } from "../Types"
import * as ConnectFour from "./ConnectFour"
import * as Snake from "./Snake"
import * as TicTacToe from "./TicTacToe"

//
//
//
// Model
//
//
//

export type Model = GameFrontendModel

//
//
//
// Update
//
//
//

export type Msg = GameFrontendMsg

export const update = (msg: Msg, model: Model): [Model, Cmd.Cmd<Msg>] => {
  return [model, Cmd.None]
}

//
//
//
// Subscriptions
//
//
//

export const subscriptions = (model: Model): Sub.Sub<Msg> => {
  return Sub.None
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
  }: { currentUserId: UserId.UserId; store: Store.Model },
  model: Model,
): UI.View<Msg> => {
  switch (model[0]) {
    case "ConnectFour": {
      return pipe(
        ConnectFour.Frontend.view(model[1]),
        UI.map(tag("ConnectFour")),
      )
    }
    case "Snake": {
      return pipe(Snake.Frontend.view(model[1]), UI.map(tag("Snake")))
    }

    case "TicTacToe": {
      return pipe(
        TicTacToe.Frontend.view({ currentUserId, store }, model[1]),
        UI.map(tag("TicTacToe")),
      )
    }
  }
}
