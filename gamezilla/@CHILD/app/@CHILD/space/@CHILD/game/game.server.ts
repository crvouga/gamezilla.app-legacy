import { Sub } from "gamezilla/@SHARED/core";
import { GameServer } from "gamezilla/@CHILD/app/@CHILD/space/@SHARED";
import * as ConnectFourServer from "./@CHILD/connect-four/connect-four.server";
import * as ChessServer from "./@CHILD/chess/chess.server";
import {
  GameEvent,
  ServerModel,
  ServerMsg,
  GameState,
  ToClient,
  ToServer,
} from "./game.core";

//
//
//
//
//
//
//

type Server = GameServer<{
  ServerModel: ServerModel;
  ServerMsg: ServerMsg;
  ToClient: ToClient;
  ToServer: ToServer;
  GameState: GameState;
  GameEvent: GameEvent;
}>;

const ConnectFour = GameServer.tag("connect-four", ConnectFourServer);
const Chess = GameServer.tag("chess", ChessServer);

//
//
//
// Model
//
//
//

export const init: Server["init"] = async (input) => {
  const { state } = input;
  switch (state.t) {
    case "connect-four": {
      return ConnectFour.init({ ...input, state });
    }
    case "chess": {
      return Chess.init({ ...input, state });
    }
  }
};

//
//
//
// Update
//
//
//

export const update: Server["update"] = async (input) => {
  const { msg, state, model } = input;

  if (
    state.t === "connect-four" &&
    model.t === "connect-four" &&
    msg.t === "connect-four"
  ) {
    return ConnectFour.update({ ...input, state, msg, model });
  }

  return { model };
};

export const updateFromClient: Server["updateFromClient"] = async (input) => {
  const { state, msg, model } = input;

  if (
    state.t === "connect-four" &&
    model.t === "connect-four" &&
    msg.t === "connect-four"
  ) {
    return ConnectFour.updateFromClient({ ...input, msg, model, state });
  }

  return { model };
};

export const updateFromEvent: Server["updateFromEvent"] = async (input) => {
  const { model, state } = input;

  if (state.t === "connect-four" && model.t === "connect-four") {
    return ConnectFour.updateFromEvent({ ...input, state, model });
  }

  return { model };
};

export const updateFromGame: Server["updateFromGame"] = async (input) => {
  const { model, prev, next, msg } = input;

  if (
    next.t === "connect-four" &&
    model.t === "connect-four" &&
    msg.t === "connect-four"
  ) {
    return ConnectFour.updateFromGame({
      ...input,
      prev: prev?.t === "connect-four" ? prev : null,
      next: next,
      model,
      msg,
    });
  }

  return { model };
};

//
//
//
// Subscriptions
//
//
//

export const subscriptions: Server["subscriptions"] = async (input) => {
  const { state, model } = input;

  if (state.t === "connect-four" && model.t === "connect-four") {
    return await ConnectFour.subscriptions({ ...input, state, model });
  }

  return Sub.None;
};
