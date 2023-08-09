import { Sub } from "@gamezilla/core";
import { GameServer } from "src/libs/feat/game-space/shared";
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

export const updateFromParent: Server["updateFromParent"] = (input) => {
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
