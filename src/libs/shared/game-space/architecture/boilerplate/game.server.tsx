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

export const init: Server["init"] = () => {
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

export const update: Server["update"] = (input) => {
  return input;
};

export const updateFromClient: Server["updateFromClient"] = (input) => {
  return input;
};

export const updateFromGameSpace: Server["updateFromGameSpace"] = (input) => {
  return input;
};

//
//
//
// Subscriptions
//
//
//

export const subscriptions: Server["subscriptions"] = () => {
  return Sub.None;
};
