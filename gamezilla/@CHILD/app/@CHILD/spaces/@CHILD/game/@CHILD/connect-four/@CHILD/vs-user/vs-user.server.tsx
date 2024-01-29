import { GameServerModule } from "gamezilla/@CHILD/app/@CHILD/spaces/@SHARED/architecture/game-server-v2";
import {
  SpaceServerCtx,
  SpaceServerEvent,
} from "gamezilla/@CHILD/app/@CHILD/spaces/@SHARED/space";
import { SpaceServerCmd } from "gamezilla/@CHILD/app/@CHILD/spaces/@SHARED/space-server-cmd";
import { Sub } from "gamezilla/@SHARED/core";
import {
  MsgGame,
  ModelGame,
  ServerModel,
  MsgServer,
  MsgToClient,
  MsgToServer,
} from "./vs-user.core";

//
//
//
//
//

type Module = GameServerModule<{
  Model: ServerModel;
  Msg: MsgServer;
  MsgToClient: MsgToClient;
  MsgToServer: MsgToServer;
  ModelGame: ModelGame;
  MsgGame: MsgGame;
  Ctx: SpaceServerCtx;
  Deps: null;
  MsgInCmd: null;
  MsgInEvent: SpaceServerEvent;
  MsgOutCmd: SpaceServerCmd<MsgToClient>;
  MsgOutEvent: null;
}>;

export const init: Module["init"] = null;

export const update: Module["update"] = async (input) => {
  return { model: input.model };
};

export const subscriptions: Module["subscriptions"] = async (_input) => {
  return Sub.None;
};
