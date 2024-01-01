import { GameServerModule } from "gamezilla/@CHILD/app/@CHILD/space/@SHARED/architecture/game-server-v2";
import {
  SpaceServerCtx,
  SpaceServerEvent,
} from "gamezilla/@CHILD/app/@CHILD/space/@SHARED/space";
import { Sub } from "gamezilla/@SHARED/core";
import {
  GameEvent,
  GameState,
  ServerModel,
  ServerMsg,
  ToClient,
  ToServer,
} from "./play.core";
import { SpaceServerCmd } from "gamezilla/@CHILD/app/@CHILD/space/@SHARED/space-server-cmd";

type Module = GameServerModule<{
  Model: ServerModel;
  Msg: ServerMsg;
  ToClient: ToClient;
  ToServer: ToServer;
  GameEvent: GameEvent;
  GameState: GameState;
  Ctx: SpaceServerCtx;
  InCmd: null;
  InEvent: SpaceServerEvent;
  OutCmd: SpaceServerCmd<ToClient>;
  OutEvent: null;
}>;

const init: Module["init"] = async () => {
  return {
    model: {},
  };
};

const update: Module["update"] = async (input) => {
  return {
    model: input.model,
  };
};

const subscriptions: Module["subscriptions"] = async () => {
  return Sub.None;
};

export const PlayServer: Module = {
  init,
  update,
  subscriptions,
};
