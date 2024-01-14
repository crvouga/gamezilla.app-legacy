import { GameServerModule } from "gamezilla/@CHILD/app/@CHILD/spaces/@SHARED/architecture/game-server-v2";
import {
  SpaceClientCtx,
  SpaceClientEvent,
} from "gamezilla/@CHILD/app/@CHILD/spaces/@SHARED/space";
import { SpaceServerCmd } from "gamezilla/@CHILD/app/@CHILD/spaces/@SHARED/space-server-cmd";
import { Sub } from "gamezilla/@SHARED/core";
import {
  GameEvent,
  GameState,
  ServerModel,
  ServerMsg,
  ToClient,
  ToServer,
  initCore,
} from "./puzzle-builder.core";

type Module = GameServerModule<{
  ToClient: ToClient;
  ToServer: ToServer;
  GameEvent: GameState;
  GameState: GameEvent;
  Ctx: SpaceClientCtx;
  InCmd: null;
  InEvent: SpaceClientEvent;
  Model: ServerModel;
  Msg: ServerMsg;
  OutCmd: SpaceServerCmd<ToClient>;
  OutEvent: null;
}>;

const init: Module["init"] = initCore;

const update: Module["update"] = async (input) => {
  return { model: input.model };
};

const subscriptions: Module["subscriptions"] = async () => {
  return Sub.None;
};

export const PuzzleBuilderServer: Module = {
  init,
  update,
  subscriptions,
};
