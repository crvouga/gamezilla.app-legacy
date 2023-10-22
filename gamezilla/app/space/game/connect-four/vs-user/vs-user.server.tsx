import { Sub } from "gamezilla/@SHARED/core";
import { SpaceGameServer } from "gamezilla/app/space/@SHARED";
import {
  Evt,
  ServerModel,
  ServerMsg,
  State,
  ToClient,
  ToServer,
} from "./vs-user.core";

type Server = SpaceGameServer<
  ServerModel,
  ServerMsg,
  ToClient,
  ToServer,
  State,
  Evt
>;

export const init: Server["init"] = async () => {
  return {
    model: null,
  };
};

export const update: Server["update"] = (input) => {
  return input;
};

export const updateFromClient: Server["updateFromClient"] = (input) => {
  return input;
};

export const updateFromEvt: Server["updateFromEvt"] = (input) => {
  return input;
};

export const subscriptions: Server["subscriptions"] = (input) => {
  return Sub.None;
};
