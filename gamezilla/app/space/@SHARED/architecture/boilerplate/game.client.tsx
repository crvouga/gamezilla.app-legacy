import { Sub } from "gamezilla/@SHARED/core";
import { SpaceGameClient } from "gamezilla/app/space/@SHARED";
import {
  ClientModel,
  ClientMsg,
  CoreModel,
  ToClient,
  ToServer,
  initShared,
} from "./game.core";

export type Client = SpaceGameClient<
  ClientModel,
  CoreModel,
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

const updateFromEvt: Client["updateFromEvt"] = (input) => {
  return input;
};

const mergeWithServer: Client["mergeWithServer"] = (input) => {
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
  updateFromEvt,
  mergeWithServer,
  subscriptions,
  View,
};
