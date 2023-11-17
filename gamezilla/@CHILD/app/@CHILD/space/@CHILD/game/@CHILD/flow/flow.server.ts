import {
  GameServer,
  sendToSpace,
} from "gamezilla/@CHILD/app/@CHILD/space/@SHARED";
import { err, Sub } from "gamezilla/@SHARED/core";
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

export const update: Server["update"] = async ({ msg, model, ...input }) => {
  switch (msg.t) {
    case "play": {
      return { model };
    }

    case "puzzle-builder": {
      return { model };
    }
  }
};

export const updateFromClient: Server["updateFromClient"] = async (input) => {
  const { msg, model, ctx } = input;

  switch (msg.t) {
    case "input-mode": {
      if (ctx.space.hostId !== ctx.currentUserId) {
        return {
          model,
          cmd: [sendToSpace({ ...msg, result: err("Must be the host") })],
        };
      }

      return { model };
    }

    case "play": {
      return { model };
    }

    case "puzzle-builder": {
      return { model };
    }
  }
};

export const updateFromEvent: Server["updateFromEvent"] = async (input) => {
  return input;
};

export const subscriptions: Server["subscriptions"] = async () => {
  return Sub.None;
};
