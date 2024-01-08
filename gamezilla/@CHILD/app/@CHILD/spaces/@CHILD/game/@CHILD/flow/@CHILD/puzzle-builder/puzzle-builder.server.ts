import { GameServer } from "gamezilla/@CHILD/app/@CHILD/spaces/@SHARED/architecture/game-server";
import { Sub } from "gamezilla/@SHARED/core";
import {
  ServerModel,
  ServerMsg,
  ToClient,
  ToServer,
  initCore,
} from "./puzzle-builder.core";

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
    model: initCore,
  };
};

const update: Server["update"] = async (input) => {
  return init(input);
};

const subscriptions: Server["subscriptions"] = async () => {
  return Sub.None;
};

export const PuzzleBuilderServer: Server = {
  init,
  update,
  subscriptions,
};
