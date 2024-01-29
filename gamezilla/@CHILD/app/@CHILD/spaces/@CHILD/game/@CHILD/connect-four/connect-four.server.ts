import { Sub } from "gamezilla/@SHARED/core";
import { GameServerModule } from "../../../../@SHARED/architecture/game-server-v2";
import { SpaceServerCtx, SpaceServerEvent } from "../../../../@SHARED/space";
import { SpaceServerCmd } from "../../../../@SHARED/space-server-cmd";
import {
  GameMsg,
  GameModel,
  ServerModel,
  ServerMsg,
  ToClient,
  ToServer,
} from "./connect-four.core";

//
//
//
//
//
//
//

type Module = GameServerModule<{
  Model: ServerModel;
  Msg: ServerMsg;
  ToClient: ToClient;
  ToServer: ToServer;
  GameModel: GameModel;
  GameMsg: GameMsg;
  Ctx: SpaceServerCtx;
  InCmd: null;
  InEvent: SpaceServerEvent;
  OutCmd: SpaceServerCmd<ToClient>;
  OutEvent: null;
  Deps: null;
}>;

//
//
//
// Model
//
//
//

const init: Module["init"] = {
  t: null,
};

//
//
//
// Update
//
//
//

const update: Module["update"] = async (input) => {
  return {
    model: input.model,
  };
};

//
//
//
// Subscriptions
//
//
//

const subscriptions: Module["subscriptions"] = async (_input) => {
  return Sub.None;
};

export const ConnectFourServer: Module = {
  init,
  update,
  subscriptions,
  deps: async () => null,
};
