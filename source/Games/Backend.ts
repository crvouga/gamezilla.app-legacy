import { ClientId } from "Bridge/Bridge";
import { Cmd, Sub, pipe } from "Core";
import { tag } from "Utility";
import * as TicTacToe from "./TicTacToe/Backend";
import { BackendModel, BackendMsg, ToBackend } from "./Types";

//
//
//
// Model
//
//
//

type Model = BackendModel;

export const init: Model = {
  ticTacToe: TicTacToe.init,
};

//
//
//
// Update
//
//
//

export const update = (
  msg: BackendMsg,
  model: Model,
): [Model, Cmd.Cmd<BackendMsg>] => {
  switch (msg[0]) {
    case "TicTacToe": {
      const [childNew, childCmd] = TicTacToe.update(msg[1], model.ticTacToe);
      return [
        { ...model, ticTacToe: childNew },
        pipe(childCmd, Cmd.map(tag("TicTacToe"))),
      ];
    }
  }
};

export const updateFromFrontend = (
  _clientId: ClientId,
  msg: ToBackend,
  model: Model,
): [Model, Cmd.Cmd<BackendMsg>] => {
  switch (msg[0]) {
    case "TicTacToe": {
      const [childNew, childCmd] = TicTacToe.updateFromFrontend(
        msg[1],
        model.ticTacToe,
      );
      return [
        { ...model, ticTacToe: childNew },
        pipe(childCmd, Cmd.map(tag("TicTacToe"))),
      ];
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

export const subscriptions = (model: Model): Sub.Sub<BackendMsg> => {
  return Sub.None;
};
