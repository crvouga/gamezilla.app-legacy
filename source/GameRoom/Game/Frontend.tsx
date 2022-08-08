import { Cmd, pipe, Sub, tag } from "../../Core"
import { UserId } from "../../Data"
import * as UI from "../../UI"
import * as Store from "../../Store"
import { GameName, GameFrontendModel, InGameFrontendMsg } from "../Types"
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

export type Msg = InGameFrontendMsg

export const update = (
  { currentUserId }: { currentUserId: UserId.UserId },
  msg: Msg,
  model: Model,
): [Model, Cmd.Cmd<Msg>] => {
  switch (model[0]) {
    case "ConnectFour": {
      if (msg[0] === "ConnectFour") {
        const [child, childCmd] = ConnectFour.Frontend.update(msg[1], model[1])
        return [
          ["ConnectFour", child],
          pipe(childCmd, Cmd.map(tag("ConnectFour"))),
        ]
      }

      return [model, Cmd.None]
    }

    case "Snake": {
      if (msg[0] === "Snake") {
        const [child, childCmd] = Snake.Frontend.update(msg[1], model[1])
        return [["Snake", child], pipe(childCmd, Cmd.map(tag("Snake")))]
      }

      return [model, Cmd.None]
    }

    case "TicTacToe": {
      if (msg[0] === "TicTacToe") {
        const [child, childCmd] = TicTacToe.Frontend.update(
          { currentUserId },
          msg[1],
          model[1],
        )

        return [["TicTacToe", child], pipe(childCmd, Cmd.map(tag("TicTacToe")))]
      }
      return [model, Cmd.None]
    }
  }
}

//
//
//
// Subscriptions
//
//
//

export const subscriptions = (model: Model): Sub.Sub<Msg> => {
  switch (model[0]) {
    case "ConnectFour": {
      return Sub.None
    }
    case "Snake": {
      return pipe(Snake.Frontend.subscriptions(model[1]), Sub.map(tag("Snake")))
    }
    case "TicTacToe": {
      return Sub.None
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
