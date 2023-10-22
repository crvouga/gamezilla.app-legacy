import { Sub } from "gamezilla/@SHARED/core";
import { SpaceGameServer } from "gamezilla/app/space/@SHARED";
import {
  Evt,
  ServerModel,
  ServerMsg,
  State,
  ToClient,
  ToServer,
  isBotTurn,
} from "./vs-bot.core";

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

export const updateFromGameEvt: Server["updateFromGameEvt"] = (input) => {
  const { model, msg, before, after } = input;

  if (!isBotTurn(before) && isBotTurn(after)) {
    return {
      model,
      eff: async (dispatch) => {},
    };
  }

  return { model };
};

export const subscriptions: Server["subscriptions"] = (input) => {
  return Sub.None;
};
