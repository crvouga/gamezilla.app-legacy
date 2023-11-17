import { Sub } from "gamezilla/@SHARED/core";
import { GameServer } from "gamezilla/@CHILD/app/@CHILD/space/@SHARED";
import {
  GameEvent,
  ServerModel,
  ServerMsg,
  GameState,
  ToClient,
  ToServer,
} from "./vs-user.core";

//
//
//
//
//

type Server = GameServer<{
  ServerModel: ServerModel;
  ServerMsg: ServerMsg;
  ToClient: ToClient;
  ToServer: ToServer;
  GameState: GameState;
  GameEvent: GameEvent;
}>;

export const init: Server["init"] = async () => {
  return {
    model: null,
  };
};

export const update: Server["update"] = async (input) => {
  return input;
};

export const updateFromClient: Server["updateFromClient"] = async (input) => {
  return input;
};

export const updateFromEvent: Server["updateFromEvent"] = async (input) => {
  return input;
};

export const subscriptions: Server["subscriptions"] = async (input) => {
  return Sub.None;
};

export const updateFromGame: Server["updateFromGame"] = async (input) => {
  const { model } = input;
  return { model };
};
