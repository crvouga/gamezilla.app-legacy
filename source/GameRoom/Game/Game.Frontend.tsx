import { Cmd, pipe, Sub, tag, tagUpdate } from "../../Core"
import { RoomId, UserId } from "../../Data"
import * as Store from "../../Store"
import * as UI from "../../UI"
import * as ConnectFour from "./ConnectFour"
import * as Snake from "./Snake"
import * as TicTacToe from "./TicTacToe"
import { FrontendModel, FrontendMsg, ToFrontend } from "./Game.Types"

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
      return ['TicTacToe',TicTacToe.Frontend.init]
    }

    case 'Snake': {
      return ['Snake', Snake.Frontend.init]
    }

    case 'ConnectFour': {
      return ['ConnectFour',ConnectFour.Frontend.init]
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

export const update = (
  { currentUserId, currentRoomId }: { currentUserId: UserId.UserId, currentRoomId: RoomId.RoomId },
  msg: Msg,
  model: Model,
): [Model, Cmd.Cmd<Msg>] => {
  switch (model[0]) {
    case "ConnectFour": {
      if (msg[0] === "ConnectFour") {
        return tagUpdate("ConnectFour", ConnectFour.Frontend.update(msg[1], model[1]))
      }

      return [model, Cmd.None]
    }

    case "Snake": {
      if (msg[0] === "Snake") {
        return tagUpdate("Snake", Snake.Frontend.update({ currentRoomId }, msg[1], model[1]))
      }
      return [model, Cmd.None]
    }

    case "TicTacToe": {
      if (msg[0] === "TicTacToe") {
        return tagUpdate("TicTacToe", TicTacToe.Frontend.update(
          { currentUserId },
          msg[1],
          model[1],
        ))
      }
      return [model, Cmd.None]
    }
  }
}


export const updateFromBackend = (msg: ToFrontend, model: Model): [Model, Cmd.Cmd<Msg>] => {
  switch(msg[0]) {
    case 'ConnectFour': {
      if(model[0] === 'ConnectFour') {
        return tagUpdate("ConnectFour", ConnectFour.Frontend.updateFromBackend(msg[1], model[1]))
      }
      return [model, Cmd.None]
    }

    case 'Snake': {
      if(model[0] === 'Snake') {
        return tagUpdate("Snake", Snake.Frontend.updateFromBackend(msg[1], model[1]))
      }
      return [model, Cmd.None]
    }

    case 'TicTacToe': {
      if(model[0] === 'TicTacToe') {
        return tagUpdate("TicTacToe", TicTacToe.Frontend.updateFromBackend(msg[1], model[1]))
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
      return pipe(Snake.Frontend.view({currentUserId}, model[1]), UI.map(tag("Snake")))
    }

    case "TicTacToe": {
      return pipe(
        TicTacToe.Frontend.view({ currentUserId, store }, model[1]),
        UI.map(tag("TicTacToe")),
      )
    }
  }
}
