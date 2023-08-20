import { Err, Ok, Sub } from "gamezilla/@SHARED/core";
import { GameServer } from "gamezilla/app/space/@SHARED";
import { ServerModel, ServerMsg, ToClient, ToServer } from "./flow.core";
import { PlayServer } from "./play";
import { PuzzleBuilderServer } from "./puzzle-builder";

type Server = GameServer<ServerModel, ServerMsg, ToClient, ToServer>;

const Play = GameServer.tag("play", PlayServer);
const PuzzleBuilder = GameServer.tag("puzzle-builder", PuzzleBuilderServer);

export const init: Server["init"] = () => {
  return {
    model: { t: "none" },
  };
};

export const update: Server["update"] = (input) => {
  return input;
};

export const updateFromClient: Server["updateFromClient"] = (input) => {
  const { msg, model, ctx } = input;

  if (msg.t === "input-mode") {
    if (ctx.hostId !== ctx.currentUserId) {
      return {
        model,
        cmd: [
          {
            t: "send-to-space",
            msg: { ...msg, result: Err("Must be the host") },
          },
        ],
      };
    }

    const initial = initMode(msg.mode)({ ...input, model: { t: "none" } });

    return {
      ...initial,
      cmd: [{ t: "send-to-space", msg: { ...msg, result: Ok(initial.model) } }],
    };
  }
  return { model };
};

const initMode =
  (mode: ServerModel["t"]): Server["updateFromClient"] =>
  (input) => {
    if (mode === "puzzle-builder") {
      return PuzzleBuilder.init(input);
    }
    if (mode === "play") {
      return Play.init(input);
    }
    return { model: { t: "none" } };
  };

export const updateFromEvent: Server["updateFromEvent"] = (input) => {
  return input;
};

export const subscriptions: Server["subscriptions"] = () => {
  return Sub.None;
};
