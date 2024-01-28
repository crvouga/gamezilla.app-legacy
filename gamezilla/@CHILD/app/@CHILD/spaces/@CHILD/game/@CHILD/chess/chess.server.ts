import { GameServer } from "gamezilla/@CHILD/app/@CHILD/spaces/@SHARED/architecture/game-server";
import { Sub } from "gamezilla/@SHARED/core";
import {
  GameEvent,
  GameState,
  ServerModel,
  ServerMsg,
  ToClient,
  ToServer,
} from "./chess.core";

//
//
//
//
//
//
//

type Server = GameServer<{
  GameEvent: GameEvent;
  GameState: GameState;
  ServerModel: ServerModel;
  ServerMsg: ServerMsg;
  ToClient: ToClient;
  ToServer: ToServer;
}>;

//
//
//
// Model
//
//
//

export const init: Server["init"] = async (input) => {
  if (input.model) {
    return { model: input.model };
  }
  return {
    model: { t: "none" },
  };
};

//
//
//
// Update
//
//
//

export const update: Server["update"] = async (_input) => {
  return {
    model: {
      t: "none",
    },
  };
};

//
//
//
// Subscriptions
//
//
//

export const subscriptions: Server["subscriptions"] = async (_input) => {
  return Sub.None;
};
