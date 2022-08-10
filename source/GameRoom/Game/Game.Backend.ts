import { Cmd, Sub, tagUpdate } from "../../Core";
import { BackendModel, BackendMsg, ToBackend } from "./Game.Types";
import * as ConnectFour from "./ConnectFour"
import * as Snake from "./Snake"
import * as TicTacToe from "./TicTacToe"
import { ClientId } from "../../Data";

//
//
//
// Model
//
//
//

export type Model = BackendModel;

export const init = (gameName: Model[0]): Model => {
  switch(gameName) {
    case 'ConnectFour': {
      return ['ConnectFour',ConnectFour.Backend.init ]
    }

    case 'Snake': {
      return ['Snake',Snake.Backend.init]
    }

    case 'TicTacToe': {
      return ['TicTacToe',TicTacToe.Backend.init]
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

export type Msg = BackendMsg

export const update = (msg: Msg, model: Model): [Model, Cmd.Cmd<Msg>] => {
  switch(msg[0]) {
    case 'ConnectFour': {
      if(model[0] === 'ConnectFour') {
        return tagUpdate("ConnectFour", ConnectFour.Backend.update(msg[1], model[1]) )
      }
      return [model, Cmd.None]
    }

    case 'TicTacToe': {
      if(model[0] === 'TicTacToe') {
        return tagUpdate("TicTacToe", TicTacToe.Backend.update(msg[1], model[1]) )
      }
      return [model, Cmd.None]
    }

    case 'Snake': {
      if(model[0] === 'Snake') {
        return tagUpdate("Snake", Snake.Backend.update(msg[1], model[1]))
      }
      return [model, Cmd.None]
    } 
  }
};

export const updateFromFrontend = (clientId: ClientId.ClientId, msg: ToBackend, model: Model): [Model, Cmd.Cmd<Msg>] => {
  switch(msg[0]) {
    case 'ConnectFour': {
      if(model[0] === 'ConnectFour') {
        return tagUpdate("ConnectFour", ConnectFour.Backend.updateFromFrontend(clientId,msg[1], model[1]) )
      }
      return [model, Cmd.None]
    }

    case 'TicTacToe': {
      if(model[0] === 'TicTacToe') {
        return tagUpdate("TicTacToe", TicTacToe.Backend.updateFromFrontend(clientId, msg[1], model[1]) )
      }
      return [model, Cmd.None]
    }

    case 'Snake': {
      if(model[0] === 'Snake') {
        return tagUpdate("Snake", Snake.Backend.updateFromFrontend(clientId,msg[1], model[1]))
      }
      return [model, Cmd.None]
    } 
  }
};

//
//
//
// Subscriptions
//
//
//

export const subscriptions = (model: Model): Sub.Sub<Msg> => {
  return Sub.None;
};
