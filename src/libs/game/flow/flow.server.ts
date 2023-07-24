import { Cmd, Err, Ok, Result, Sub } from "@gamezilla/core";
import { SpaceReqServerCtx } from "@gamezilla/shared/server";
import { ServerModel, ServerMsg, ToClient, ToServer } from "./flow.core";
import { PuzzleBuilderServer } from "./puzzle-builder";
import { PlayServer } from "./play";

type Model = ServerModel;

export const init: Model = {
  t: "none",
};

type Msg = ServerMsg;

export const update = ({
  model,
}: {
  msg: Msg;
  model: Model;
}): {
  model: Model;
  cmd?: Cmd<Msg>;
} => {
  return { model };
};

export const updateFromClient = ({
  msg,
  model,
  ctx,
  broadcast,
}: {
  ctx: SpaceReqServerCtx;
  msg: ToServer;
  model: Model;
  broadcast: (m: ToClient) => Cmd;
}): {
  model: Model;
  cmd?: Cmd<Msg>;
} => {
  if (msg.t === "input-mode") {
    const handled = handleInputMode({ mode: msg.mode, ctx });
    return {
      model: handled.t === "err" ? model : handled.value,
      cmd: broadcast({ ...msg, result: handled }),
    };
  }

  return { model };
};

const handleInputMode = ({
  mode,
  ctx,
}: {
  ctx: SpaceReqServerCtx;
  mode: Model["t"];
}): Result<string, Model> => {
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

export const subscriptions = (_model: Model): Sub<Msg> => {
  return Sub.None;
};
