import { Err, Ok, Result, Sub } from "@gamezilla/core";
import { GameServer, GameSpaceReqCtx } from "@gamezilla/shared/game-space";
import { ServerModel, ServerMsg, ToClient, ToServer } from "./flow.core";
import { PlayServer } from "./play";
import { PuzzleBuilderServer } from "./puzzle-builder";

type Server = GameServer<ServerModel, ServerMsg, ToClient, ToServer>;

export const init: Server["init"] = () => {
  return {
    model: { t: "none" },
  };
};

export const update: Server["update"] = (input) => {
  return input;
};

export const updateFromClient: Server["updateFromClient"] = ({
  msg,
  model,
  ctx,
  sendToSpace,
}) => {
  if (msg.t === "input-mode") {
    const handled = handleInputMode({ mode: msg.mode, ctx });
    return {
      model: handled.t === "err" ? model : handled.value,
      cmd: sendToSpace({ ...msg, result: handled }),
    };
  }

  return { model };
};

const handleInputMode = ({
  mode,
  ctx,
}: {
  ctx: GameSpaceReqCtx;
  mode: ServerModel["t"];
}): Result<string, ServerModel> => {
  if (ctx.hostId !== ctx.currentUserId) {
    return Err("must-be-host");
  }

  if (mode === "puzzle-builder") {
    return Ok({ t: "puzzle-builder", c: PuzzleBuilderServer.init });
  }

  if (mode === "play") {
    return Ok({ t: "play", c: PlayServer.init });
  }

  if (mode === "none") {
    return Ok({ t: "none" });
  }

  return Err("invalid-mode");
};

export const updateFromGameSpace: Server["updateFromGameSpace"] = (input) => {
  return input;
};

export const subscriptions: Server["subscriptions"] = () => {
  return Sub.None;
};
