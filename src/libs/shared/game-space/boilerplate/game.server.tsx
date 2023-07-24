import { Sub } from "@gamezilla/core";
import { GameServer } from "@gamezilla/shared/game-space";
import {
  ServerModel,
  ServerMsg,
  ToClient,
  ToServer,
  initShared,
} from "./game.core";

export type Server = GameServer<ServerModel, ServerMsg, ToClient, ToServer>;

//
//
//
// Init
//
//
//

const init: Server["init"] = () => {
  return {
    model: initShared,
  };
};

//
//
//
// Update
//
//
//

const update: Server["update"] = (input) => {
  return input;
};

const updateFromClient: Server["updateFromClient"] = (input) => {
  return input;
};

const updateFromGameSpace: Server["updateFromGameSpace"] = (input) => {
  return input;
};

//
//
//
// Subscriptions
//
//
//

const subscriptions: Server["subscriptions"] = () => {
  return Sub.None;
};

//
//
//
// Module
//
//
//

export const server: Server = {
  init,
  update,
  updateFromClient,
  updateFromGameSpace,
  subscriptions,
};
