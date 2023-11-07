import { Sub } from "gamezilla/@SHARED/core";
import { GameServer } from "gamezilla/app/space/@SHARED";
import {
  GameEvent,
  ServerModel,
  ServerMsg,
  GameState,
  ToClient,
  ToServer,
} from "./vs-user.core";

type Server = GameServer<
  ServerModel,
  ServerMsg,
  ToClient,
  ToServer,
  GameState,
  GameEvent
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

export const updateFromEvent: Server["updateFromEvent"] = (input) => {
  return input;
};

export const subscriptions: Server["subscriptions"] = (input) => {
  return Sub.None;
};

export const updateFromGame: Server["updateFromGame"] = (input) => {
  const { model } = input;
  return { model };
};
