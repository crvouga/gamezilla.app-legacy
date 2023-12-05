import { GameServer } from "gamezilla/@CHILD/app/@CHILD/space/@SHARED/architecture";
import { Sub } from "gamezilla/@SHARED/core";
import { ServerModel, ServerMsg, ToClient, ToServer } from "./flow.core";

type Server = GameServer<{
  ServerModel: ServerModel;
  ServerMsg: ServerMsg;
  ToClient: ToClient;
  ToServer: ToServer;
  GameEvent: null;
  GameState: null;
}>;

export const init: Server["init"] = async () => {
  return { model: { t: "none" } };
};

export const update: Server["update"] = async (input) => {
  return init(input);
};

export const subscriptions: Server["subscriptions"] = async () => {
  return Sub.None;
};
