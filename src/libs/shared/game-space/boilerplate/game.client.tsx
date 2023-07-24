import { Sub } from "@gamezilla/core";
import { GameClient } from "@gamezilla/shared/game-space";
import {
  ClientModel,
  ClientMsg,
  SharedModel,
  ToClient,
  ToServer,
  initShared,
} from "./game.core";

export type Client = GameClient<
  ClientModel,
  SharedModel,
  ClientMsg,
  ToClient,
  ToServer
>;

//
//
//
// Init
//
//
//

const init: Client["init"] = () => {
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

const update: Client["update"] = (input) => {
  return input;
};

const updateFromServer: Client["updateFromServer"] = (input) => {
  return input;
};

const updateFromGameSpace: Client["updateFromGameSpace"] = (input) => {
  return input;
};

const syncWithServer: Client["syncWithServer"] = (input) => {
  return { model: input.client ?? init(input).model };
};

//
//
//
// Subscriptions
//
//
//

const subscriptions: Client["subscriptions"] = () => {
  return Sub.None;
};

//
//
//
// View
//
//
//

const View: Client["View"] = (input) => {
  return <pre>{JSON.stringify(input, null, 2)}</pre>;
};

//
//
//
// Module
//
//
//

export const client: Client = {
  init,
  update,
  updateFromServer,
  updateFromGameSpace,
  syncWithServer,
  subscriptions,
  View,
};
