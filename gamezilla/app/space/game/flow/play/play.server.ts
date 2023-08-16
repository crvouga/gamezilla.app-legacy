import { GameServer } from "gamezilla/app/space/@SHARED";
import {
  ServerModel,
  ServerMsg,
  ToClient,
  ToServer,
  initShared,
} from "./play.core";
import { Sub } from "gamezilla/@SHARED/core";

type Server = GameServer<ServerModel, ServerMsg, ToClient, ToServer>;

const init: Server["init"] = () => {
  return {
    model: initShared,
  };
};

const update: Server["update"] = (input) => {
  return input;
};

const updateFromClient: Server["updateFromClient"] = (input) => {
  return input;
};

const updateFromEvent: Server["updateFromEvent"] = (input) => {
  return input;
};

const subscriptions: Server["subscriptions"] = () => {
  return Sub.None;
};

export const PlayServer: Server = {
  init,
  update,
  updateFromClient,
  updateFromEvent,
  subscriptions,
};
