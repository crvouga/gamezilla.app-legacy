import { GameServer } from "gamezilla/@CHILD/app/@CHILD/spaces/@SHARED/architecture/game-server";
import * as ConnectFourServer from "./@CHILD/connect-four/connect-four.server";
import {
  GameEvent,
  ServerModel,
  ServerMsg,
  GameState,
  ToClient,
  ToServer,
} from "./game.core";
import { Sub } from "gamezilla/@SHARED/core";

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
// const Chess = GameServer.tag("chess", ChessServer);

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

    case "flow": {
      return { model: { t: "flow", c: { t: "none" } } };
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
  const { msg, state, ctx, gameEvent, clientMsg, event } = input;

  return GameServer.chain(
    init(input),

    async (model) => {
      switch (state.t) {
        case "flow": {
          return { model };
        }

        case "connect-four": {
          return ConnectFour.update({
            ctx,
            state,
            model: model.t === "connect-four" ? model : null,
            msg: msg?.t === "connect-four" ? msg : null,
            clientMsg: clientMsg?.t === "connect-four" ? clientMsg : null,
            event,
            gameEvent:
              gameEvent?.t === "connect-four"
                ? { ...gameEvent, c: { ...gameEvent, ...gameEvent.c } }
                : null,
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
    case "connect-four": {
      return await ConnectFour.subscriptions({
        ...input,
        state,
        model: model?.t === "connect-four" ? model : null,
      });
    }

    case "flow": {
      return Sub.None;
    }
  }
};
