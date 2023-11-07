import { err, ok, Sub } from "gamezilla/@SHARED/core";
import {
  GameServer,
  sendToSpace,
} from "gamezilla/@CHILD/app/@CHILD/space/@SHARED";
import { ServerModel, ServerMsg, ToClient, ToServer } from "./flow.core";
import { PlayServer } from "./@CHILD/play";
import { PuzzleBuilderServer } from "./@CHILD/puzzle-builder";

type Server = GameServer<ServerModel, ServerMsg, ToClient, ToServer>;

export const init: Server["init"] = () => {
  return { model: { t: "none" } };
};

export const update: Server["update"] = ({ msg, model, ...input }) => {
  switch (msg.t) {
    case "play": {
      return { model };
    }

    case "puzzle-builder": {
      return { model };
    }
  }
};

export const updateFromClient: Server["updateFromClient"] = (input) => {
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

export const updateFromEvent: Server["updateFromEvent"] = (input) => {
  return input;
};

export const subscriptions: Server["subscriptions"] = () => {
  return Sub.None;
};
