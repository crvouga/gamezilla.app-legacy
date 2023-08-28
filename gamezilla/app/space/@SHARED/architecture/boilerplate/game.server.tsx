import { Sub } from "gamezilla/@SHARED/core";
import { GameServer } from "gamezilla/app/space/@SHARED";
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

export const updateFromEvt: Server["updateFromEvt"] = (input) => {
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
