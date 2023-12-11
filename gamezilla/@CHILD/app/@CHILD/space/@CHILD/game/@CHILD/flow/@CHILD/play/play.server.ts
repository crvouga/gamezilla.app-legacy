import { GameServer } from "gamezilla/@CHILD/app/@CHILD/space/@SHARED/architecture/game-server";
import {
  ServerModel,
  ServerMsg,
  ToClient,
  ToServer,
  initShared,
} from "./play.core";
import { Sub } from "gamezilla/@SHARED/core";

type Server = GameServer<{
  ServerModel: ServerModel;
  ServerMsg: ServerMsg;
  ToClient: ToClient;
  ToServer: ToServer;
  GameEvent: null;
  GameState: null;
}>;

const init: Server["init"] = async () => {
  return {
    model: initShared,
  };
};

const update: Server["update"] = async (input) => {
  return init(input);
};

const subscriptions: Server["subscriptions"] = async () => {
  return Sub.None;
};

export const PlayServer: Server = {
  init,
  update,
  subscriptions,
};
