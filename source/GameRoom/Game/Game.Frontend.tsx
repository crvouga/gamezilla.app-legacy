import { Cmd, pipe, Sub, tag, tagCmd, tagUpdate } from "../../Core"
import { RoomId, UserId } from "../../Data"
import * as Store from "../../Store"
import * as Snackbar from "../../Snackbar"
import * as UI from "../../UI"
import * as ConnectFour from "./ConnectFour/ConnectFour.Frontend"
import * as Snake from "./Snake/Snake.Frontend"
import * as TicTacToe from "./TicTacToe/TicTacToe.Frontend"
import { FrontendModel, FrontendMsg, GameName, ToFrontend } from "./Game.Types"

//
//
//
// Model
//
//
//

export type Model = FrontendModel

export const init = (gameName: Model[0]): Model => {
  switch(gameName) {
    case 'TicTacToe': {
      return ['TicTacToe',TicTacToe.init]
    }

    case 'Snake': {
      return ['Snake', Snake.init]
    }

    case 'ConnectFour': {
      return ['ConnectFour',ConnectFour.init]
    }
  }
}

//
//
//
// Update
//
//
//

export type Msg = FrontendMsg

export type OutAction = Snackbar.Action

export const update = (
  { currentUserId, currentRoomId }: { currentUserId: UserId.UserId, currentRoomId: RoomId.RoomId },
  msg: Msg,
  model: Model,
): [Model, Cmd.Cmd<Msg>] => {
  switch (model[0]) {
    case "ConnectFour": {
      if (msg[0] === "ConnectFour") {
        return tagUpdate("ConnectFour", ConnectFour.update(msg[1], model[1]))
      }

      return [model, Cmd.None]
    }

    case "Snake": {
      if (msg[0] === "Snake") {
        return tagUpdate("Snake", Snake.update({ currentUserId, currentRoomId }, msg[1], model[1]))
      }
      return [model, Cmd.None]
    }

    case "TicTacToe": {
      if (msg[0] === "TicTacToe") {
        return tagUpdate("TicTacToe", TicTacToe.update(
          { currentUserId },
          msg[1],
          model[1],
        ))
      }
      return [model, Cmd.None]
    }
  }
}


export const updateFromBackend = (msg: ToFrontend, model: Model): [Model, Cmd.Cmd<Msg> , OutAction[]] => {
  switch(msg[0]) {
    case 'ConnectFour': {
      if(model[0] === 'ConnectFour') {
        return [...tagUpdate("ConnectFour", ConnectFour.updateFromBackend(msg[1], model[1])), []]
      }
      return [model, Cmd.None, []]
    }

    case 'Snake': {
      if(model[0] === 'Snake') {
        const [child, cmd, actions] = Snake.updateFromBackend(msg[1], model[1])
        return [['Snake', child], tagCmd("Snake", cmd), actions]
      }
      return [model, Cmd.None, []]
    }

    case 'TicTacToe': {
      if(model[0] === 'TicTacToe') {
        return [...tagUpdate("TicTacToe", TicTacToe.updateFromBackend(msg[1], model[1])), []]
      }
      return [model, Cmd.None, []]
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
      return pipe(Snake.subscriptions(model[1]), Sub.map(tag("Snake")))
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
        ConnectFour.view(model[1]),
        UI.map(tag("ConnectFour")),
      )
    }

    case "Snake": {
      return pipe(Snake.view({currentUserId}, model[1]), UI.map(tag("Snake")))
    }

    case "TicTacToe": {
      return pipe(
        TicTacToe.view({ currentUserId, store }, model[1]),
        UI.map(tag("TicTacToe")),
      )
    }
  }
}


export const gameNameToString = (game: GameName): string => {
  switch (game) {
    case "ConnectFour":
      return "Connect Four"

    case "TicTacToe":
      return "Tic Tac Toe"

    case "Snake":
      return "Snake"
  }
}