import { Sub } from "gamezilla/@SHARED/core";
import { GameServer } from "gamezilla/app/space/@SHARED";
import {
  ServerModel,
  ServerMsg,
  ToClient,
  ToServer,
  initCore,
} from "./puzzle-builder.core";

type Server = GameServer<ServerModel, ServerMsg, ToClient, ToServer>;

const init: Server["init"] = () => {
  return {
    model: initCore,
  };
};

const update: Server["update"] = (input) => {
  return input;
};

const updateFromClient: Server["updateFromClient"] = (input) => {
  return input;
};

const updateFromEvt: Server["updateFromEvt"] = (input) => {
  return input;
};

const subscriptions: Server["subscriptions"] = () => {
  return Sub.None;
};

export const PuzzleBuilderServer: Server = {
  init,
  update,
  updateFromClient,
  updateFromEvt,
  subscriptions,
};
