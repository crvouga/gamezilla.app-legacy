import * as TicTacToe from "./TicTacToe/Backend";
import { ClientId } from "../Bridge/Bridge";
import { Cmd, Sub, pipe } from "../Core";
import { tag } from "../Core";
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
  clientId: ClientId,
  msg: ToBackend,
  model: Model,
): [Model, Cmd.Cmd<BackendMsg>] => {
  switch (msg[0]) {
    case "TicTacToe": {
      const [childNew, childCmd] = TicTacToe.updateFromFrontend(
        clientId,
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
  return Sub.batch([
    pipe(TicTacToe.subscriptions(model.ticTacToe), Sub.map(tag("TicTacToe"))),
  ]);
};
