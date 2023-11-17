import { GameServer } from "gamezilla/@CHILD/app/@CHILD/space/@SHARED";
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
  return input;
};

const updateFromClient: Server["updateFromClient"] = async (input) => {
  return input;
};

const updateFromEvent: Server["updateFromEvent"] = async (input) => {
  return input;
};

const subscriptions: Server["subscriptions"] = async () => {
  return Sub.None;
};

export const updateFromGame: Server["updateFromGame"] = async (input) => {
  const { model } = input;
  return { model };
};

export const PlayServer: Server = {
  init,
  update,
  updateFromClient,
  updateFromEvent,
  subscriptions,
  updateFromGame: updateFromGame,
};
