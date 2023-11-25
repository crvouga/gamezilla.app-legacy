import { Sub, chainAwait } from "gamezilla/@SHARED/core";
import { GameServer } from "gamezilla/@CHILD/app/@CHILD/space/@SHARED";
import {
  GameEvent,
  ServerModel,
  ServerMsg,
  GameState,
  ToClient,
  ToServer,
  isBotTurn,
  toBotPlayer,
} from "./vs-bot.core";
import * as ConnectFour from "../../@SHARED/connect-four/connect-four";
import { ConnectFourBotWorker } from "../../@SHARED/connect-four";

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

export const init: Server["init"] = async ({ model }) => {
  if (model) {
    return { model };
  }
  return { model: null };
};

export const update: Server["update"] = async (input) => {
  return chainAwait(
    await init(input),
    //
    (model) => {
      return { model };
    },
    (model) => {
      return { model };
    }
  );
};

export const subscriptions: Server["subscriptions"] = async (input) => {
  return Sub.None;
};
