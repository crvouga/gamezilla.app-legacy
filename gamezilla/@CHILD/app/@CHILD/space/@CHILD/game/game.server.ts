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
  const { state, model } = input;

  switch (state.t) {
    case "connect-four": {
      return ConnectFour.init({
        state,
        ctx: input.ctx,
        model: model?.t === "connect-four" ? model : null,
      });
    }

    case "chess": {
      return Chess.init({
        ctx: input.ctx,
        state,
        model: model?.t === "chess" ? model : null,
      });
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
  const { msg, state, ctx, gameEvent, clientMsg, evt } = input;

  return GameServer.chain(
    init(input),

    async (model) => {
      switch (state.t) {
        case "chess": {
          return Chess.update({
            ctx,
            state,
            model: model.t === "chess" ? model : null,
            msg: msg?.t === "chess" ? msg : null,
            clientMsg: clientMsg?.t === "chess" ? clientMsg : null,
            evt,
            gameEvent: gameEvent?.t === "chess" ? gameEvent : null,
          });
        }

        case "connect-four": {
          return ConnectFour.update({
            ctx,
            state,
            model: model.t === "connect-four" ? model : null,
            msg: msg?.t === "connect-four" ? msg : null,
            clientMsg: clientMsg?.t === "connect-four" ? clientMsg : null,
            evt,
            gameEvent: gameEvent?.t === "connect-four" ? gameEvent : null,
          });
        }
      }
    }
  );
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

  switch (state.t) {
    case "chess": {
      return Sub.None;
    }

    case "connect-four": {
      return await ConnectFour.subscriptions({
        ...input,
        state,
        model: model?.t === "connect-four" ? model : null,
      });
    }
  }
};
